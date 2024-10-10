const express = require('express');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const catwayRoutes = require('./routes/catwayRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const session = require('express-session'); 
const passport = require('./config/passport'); 
const flash = require('connect-flash'); 
const Catway = require('./models/Catway'); 
const Reservation = require('./models/Reservation'); 
const User = require('./models/User'); 
const ensureAuthenticated = require('./middleware/authMiddleware');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de la session
app.use(session({
    secret: 'your-secret-key',  
    resave: false,
    saveUninitialized: false
}));

// Initialisation de Passport.js pour l'authentification
app.use(passport.initialize());
app.use(passport.session()); 

// Middleware pour les messages flash
app.use(flash());

// Connexion à la base de données
connectDB();

app.use(express.urlencoded({ extended: true })); 

// Utilisation des routes
app.use('/auth', authRoutes); 
app.use('/reservations', reservationRoutes);
app.use('/catways', catwayRoutes);

// Configuration du moteur de template
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs'); 



// Routes pour les API
app.use('/catways', catwayRoutes);
app.use('/reservations', reservationRoutes);
app.use('/auth', authRoutes);

// Route de la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  
});

// Route du tableau de bord
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));  
});

// Route pour servir la documentation
app.get('/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'documentation.html'));  
});

// Démarrer le serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

// Route pour afficher les détails d'un catway
app.get('/catways/details/:id', async (req, res) => {
    const catwayId = req.params.id; 

    try {
        const catway = await Catway.findById(catwayId); 
        if (!catway) {
            return res.redirect('/dashboard?message=Catway non trouvé');
        }

        // Affiche les détails du catway
        res.send(`
            <h1>Détails du Catway</h1>
            <p><strong>Numéro de Catway :</strong> ${catway.catwayNumber}</p>
            <p><strong>Type :</strong> ${catway.type}</p>
            <p><strong>État du Catway :</strong> ${catway.catwayState}</p>
            <a href="/catways/list">Retour à la liste des catways</a>
        `);
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?message=Erreur lors de la récupération des détails du catway');
    }
});

// Route pour afficher les détails d'une réservation
app.get('/reservations/details/:id', async (req, res) => {
    const reservationId = req.params.id;

    try {
        const reservation = await Reservation.findById(reservationId); 
        if (!reservation) {
            return res.redirect('/dashboard?message=Réservation non trouvée');
        }

        // Affiche les détails de la réservation
        res.send(`
            <h1>Détails de la Réservation</h1>
            <p><strong>Nom du Client :</strong> ${reservation.clientName}</p>
            <p><strong>Nom du Bateau :</strong> ${reservation.boatName}</p>
            <p><strong>Date d'Arrivée :</strong> ${new Date(reservation.checkIn).toLocaleString()}</p>
            <p><strong>Date de Départ :</strong> ${new Date(reservation.checkOut).toLocaleString()}</p>
            <p><strong>Numéro de Catway :</strong> ${reservation.catwayNumber}</p>
            <a href="/reservations/list">Retour à la liste des réservations</a>
        `);
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?message=Erreur lors de la récupération des détails de la réservation');
    }
});



// Route pour afficher la liste des catways
app.get('/catways/list', async (req, res) => {
    try {
        const catways = await Catway.find(); 
        res.send(`
            <h1>Liste des Catways</h1>
            <ul>
                ${catways.map(catway => `<li>${catway.catwayNumber} (ID: ${catway._id})</li>`).join('')}
            </ul>
            <a href="/dashboard">Retour au tableau de bord</a>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des catways.');
    }
});

// Route pour afficher la liste des réservations
app.get('/reservations/list', async (req, res) => {
    try {
        const reservations = await Reservation.find(); 
        const message = req.query.message; 
        res.send(`
            <h1>Liste des Réservations</h1>
            ${message ? `<p style="color:green;">${message}</p>` : ''}
            <ul>
                ${reservations.map(reservation => `
                    <li>
                        <strong>Client :</strong> ${reservation.clientName} -
                        <strong>Bateau :</strong> ${reservation.boatName} -
                        <strong>Catway :</strong> ${reservation.catwayNumber} - <!-- Utilisation de catwayNumber ici -->
                        <strong>Dates :</strong> ${new Date(reservation.checkIn).toLocaleString()} à ${new Date(reservation.checkOut).toLocaleString()}
                    </li>`).join('')}
            </ul>
            <a href="/dashboard">Retour au tableau de bord</a>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des réservations.');
    }
});

// Page d'accueil
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>Page d'accueil</h1>
                ${req.flash('error').length > 0 ? `<p style="color:red;">${req.flash('error')[0]}</p>` : ''}
                ${req.flash('success').length > 0 ? `<p style="color:green;">${req.flash('success')[0]}</p>` : ''}
                <form action="/auth/login" method="POST">
                    <label for="email">Email:</label>
                    <input type="email" name="email" required>
                    <label for="password">Mot de passe:</label>
                    <input type="password" name="password" required>
                    <button type="submit">Connexion</button>
                </form>
                <a href="/auth/signup">Créer un compte</a>
            </body>
        </html>
    `);
});

// Route GET pour afficher le formulaire d'enregistrement
app.get('/register', (req, res) => {
    res.send(`
        <form action="/auth/register" method="POST">
            <label for="userId">User ID:</label>
            <input type="text" name="userId" required><br>
            <label for="email">Email:</label>
            <input type="email" name="email" required><br>
            <label for="password">Password:</label>
            <input type="password" name="password" required><br>
            <input type="submit" value="Register">
        </form>
    `);
});

// Route pour créer un utilisateur
app.post('/auth/register', async (req, res) => {
    const { userId, email, password } = req.body; 

    try {
        // Crée un nouvel utilisateur
        const newUser = new User({ userId, email, password });
        await newUser.save(); 
        
        res.redirect('/dashboard?message=Utilisateur créé avec succès'); 
    } catch (error) {
        console.error(error);
        res.redirect('/register?message=Erreur lors de la création de l’utilisateur'); 
    }
});



// Route pour modifier un utilisateur
app.post('/auth/update-user', async (req, res) => {
    const { userId, email, password } = req.body; 

    try {
        const updateData = { email };
        if (password) {
            updateData.password = password; 
        }

        // Rechercher l'utilisateur par userId
        const user = await User.findOneAndUpdate({ userId }, updateData, { new: true });
        if (!user) {
            return res.redirect('/dashboard?message=Utilisateur non trouvé');
        }
        res.redirect('/dashboard?message=Utilisateur modifié avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?message=Erreur lors de la modification de l’utilisateur');
    }
});


// Route pour supprimer un utilisateur
app.post('/auth/delete-user', async (req, res) => {
    const { userId } = req.body; 

    try {
        // Rechercher et supprimer l'utilisateur par userId
        const user = await User.findOneAndDelete({ userId });
        
        if (!user) {
            return res.redirect('/dashboard?message=Utilisateur non trouvé');
        }

        res.redirect('/dashboard?message=Utilisateur supprimé avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?message=Erreur lors de la suppression de l’utilisateur');
    }
});


// Route pour créer un catway
app.post('/catways/create', async (req, res) => {
    const { catwayId, catwayNumber, type, catwayState } = req.body; 

    try {
        const newCatway = new Catway({ catwayId, catwayNumber, type, catwayState });
        await newCatway.save(); 
        res.redirect('/dashboard?message=Catway créé avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?message=Erreur lors de la création du catway');
    }
});


// Route pour modifier un catway
app.post('/catways/update', async (req, res) => {
    const { catwayId, catwayNumber, type, catwayState } = req.body; 

    try {
        const updatedCatway = await Catway.findOneAndUpdate(
            { catwayId }, 
            { catwayNumber, type, catwayState },
            { new: true } 
        );

        if (!updatedCatway) {
            return res.redirect('/dashboard?message=Catway non trouvé');
        }

        res.redirect('/dashboard?message=Catway modifié avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?message=Erreur lors de la modification du catway');
    }
});


// Route pour supprimer un catway
app.post('/catways/delete', async (req, res) => {
    const { catwayId } = req.body; 

    try {
        const deletedCatway = await Catway.findOneAndDelete({ catwayId }); 
        if (!deletedCatway) {
            return res.redirect('/dashboard?message=Catway non trouvé');
        }
        res.redirect('/dashboard?message=Catway supprimé avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?message=Erreur lors de la suppression du catway');
    }
});


// Route pour modifier une réservation
app.post('/reservations/update', async (req, res) => {
    const { reservationId, clientName, boatName, checkIn, checkOut } = req.body; 

    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(reservationId, { clientName, boatName, checkIn, checkOut }, { new: true });
        if (!updatedReservation) {
            return res.redirect('/reservations/list?message=Réservation non trouvée');
        }
        res.redirect('/reservations/list?message=Réservation modifiée avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/reservations/list?message=Erreur lors de la modification de la réservation');
    }
});

// Route pour supprimer une réservation
app.post('/reservations/delete', async (req, res) => {
    const { reservationId } = req.body; 

    try {
        await Reservation.findByIdAndDelete(reservationId);
        res.redirect('/reservations/list?message=Réservation supprimée avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/reservations/list?message=Erreur lors de la suppression de la réservation');
    }
});


app.post('/reservations', async (req, res) => {
    console.log(req.body); 
    const { reservationId, catwayNumber, clientName, boatName, checkIn, checkOut } = req.body;

    try {
        // Convertir les dates en objets Date
        const newReservation = new Reservation({
            reservationId,
            catwayNumber,
            clientName,
            boatName,
            checkIn: new Date(checkIn),  
            checkOut: new Date(checkOut)  
        });
        await newReservation.save(); 

        res.redirect('/dashboard?message=Réservation enregistrée avec succès');
    } catch (error) {
        console.error('Erreur lors de la création de la réservation:', error);
        res.redirect('/reservations?message=Erreur lors de la création de la réservation');
    }
});


// Route pour enregistrer une réservation
app.post('/reservations', async (req, res) => {
    const { reservationId, catwayNumber, clientName, boatName, checkIn, checkOut } = req.body; 

    try {
        // Crée une nouvelle réservation
        const newReservation = new Reservation({ reservationId, catwayNumber, clientName, boatName, checkIn, checkOut });
        await newReservation.save(); 

        // Renvoie une réponse de succès
        res.redirect('/dashboard?message=Réservation enregistrée avec succès');
    } catch (error) {
        console.error('Erreur lors de la création de la réservation:', error);
        res.redirect('/reservations?message=Erreur lors de la création de la réservation');
    }
});




