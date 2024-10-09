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
app.use(express.urlencoded({ extended: false }));

// Configuration de la session
app.use(session({
    secret: 'your-secret-key',  // Clé secrète pour la session
    resave: false,
    saveUninitialized: false
}));

// Initialisation de Passport.js pour l'authentification
app.use(passport.initialize());
app.use(passport.session()); // Nécessaire si tu veux maintenir les sessions

// Middleware pour les messages flash
app.use(flash());

// Connexion à la base de données
connectDB();

app.use(express.urlencoded({ extended: true })); // Pour parser les données du formulaire

// Utilisation des routes
app.use('/auth', authRoutes); // Assurez-vous que ces routes sont définies dans le bon fichier
app.use('/reservations', reservationRoutes);
app.use('/catways', catwayRoutes);

// Configuration du moteur de template
app.set('views', path.join(__dirname, 'views')); // Assurez-vous que le chemin est correct
app.set('view engine', 'ejs'); // Ou le moteur de votre choix



// Routes pour les API
app.use('/catways', catwayRoutes);
app.use('/reservations', reservationRoutes);
app.use('/auth', authRoutes);

// Route de la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Page d'accueil
});

// Route du tableau de bord
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));  // Tableau de bord
});

// Route pour servir la documentation
app.get('/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'documentation.html'));  // Documentation API
});

// Démarrer le serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

// Route pour afficher les détails d'un catway
app.get('/catways/details/:id', async (req, res) => {
    const catwayId = req.params.id; // Récupère l'ID du catway depuis les paramètres d'URL

    try {
        const catway = await Catway.findById(catwayId); // Recherche le catway par ID
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
app.get('/reservations/details', async (req, res) => {
    const reservationId = req.query.reservationId; // Récupère l'ID de la réservation depuis la requête

    try {
        const reservation = await Reservation.findById(reservationId).populate('catwayId'); // Recherche la réservation par ID
        if (!reservation) {
            return res.status(404).send('Réservation non trouvée');
        }
        res.send(`
            <h1>Détails de la Réservation</h1>
            <p><strong>Nom du Client :</strong> ${reservation.clientName}</p>
            <p><strong>Nom du Bateau :</strong> ${reservation.boatName}</p>
            <p><strong>Date d'Arrivée :</strong> ${new Date(reservation.checkIn).toLocaleString()}</p>
            <p><strong>Date de Départ :</strong> ${new Date(reservation.checkOut).toLocaleString()}</p>
            <a href="/reservations/list">Retour à la liste des réservations</a>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de la réservation');
    }
});

// Route pour afficher les détails d'une réservation par ID dans l'URL
app.get('/reservations/details/:id', async (req, res) => {
    const reservationId = req.params.id; // Récupère l'ID de la réservation depuis les paramètres d'URL

    try {
        const reservation = await Reservation.findById(reservationId).populate('catwayId'); // Recherche la réservation par ID
        if (!reservation) {
            return res.status(404).send('Réservation non trouvée');
        }
        res.send(`
            <h1>Détails de la Réservation</h1>
            <p><strong>Nom du Client :</strong> ${reservation.clientName}</p>
            <p><strong>Nom du Bateau :</strong> ${reservation.boatName}</p>
            <p><strong>Date d'Arrivée :</strong> ${new Date(reservation.checkIn).toLocaleString()}</p>
            <p><strong>Date de Départ :</strong> ${new Date(reservation.checkOut).toLocaleString()}</p>
            <a href="/reservations/list">Retour à la liste des réservations</a>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de la réservation');
    }
});

// Route pour afficher la liste des catways
app.get('/catways/list', async (req, res) => {
    try {
        const catways = await Catway.find(); // Récupère tous les catways
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
        const reservations = await Reservation.find().populate('catwayId'); // Récupère toutes les réservations et les catways associés
        const message = req.query.message; // Récupère le message de succès ou d'erreur s'il existe
        res.send(`
            <h1>Liste des Réservations</h1>
            ${message ? `<p style="color:green;">${message}</p>` : ''}
            <ul>
                ${reservations.map(reservation => `
                    <li>
                        <strong>Client :</strong> ${reservation.clientName} -
                        <strong>Bateau :</strong> ${reservation.boatName} -
                        <strong>Catway :</strong> ${reservation.catwayId ? reservation.catwayId.catwayNumber : 'Non spécifié'} -
                        <strong>Statut :</strong> ${reservation.status}
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

// Route pour créer un utilisateur
app.post('/auth/register', async (req, res) => {
    const { userId, email, password } = req.body; // Récupère les données du formulaire

    try {
        // Crée un nouvel utilisateur
        const newUser = new User({ userId, email, password });
        await newUser.save(); // Enregistre l'utilisateur dans la base de données
        
        res.redirect('/dashboard?message=Utilisateur créé avec succès'); // Redirige vers le tableau de bord
    } catch (error) {
        console.error(error);
        res.redirect('/register?message=Erreur lors de la création de l’utilisateur'); // Redirige vers le formulaire en cas d'erreur
    }
});



// Route pour modifier un utilisateur
app.post('/auth/update-user', async (req, res) => {
    const { userId, email, password } = req.body; // Récupère les données du formulaire

    try {
        const updateData = { email };
        if (password) {
            updateData.password = password; // N'inclure le mot de passe que s'il est présent
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
    const { userId } = req.body; // Récupère l'ID de l'utilisateur

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
    const { catwayNumber, type, catwayState } = req.body; // Récupère les données du formulaire

    try {
        const newCatway = new Catway({ catwayNumber, type, catwayState });
        await newCatway.save(); // Enregistre le nouveau catway dans la base de données
        res.redirect('/dashboard?message=Catway créé avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?message=Erreur lors de la création du catway');
    }
});

// Route pour modifier un catway
app.post('/catways/update', async (req, res) => {
    const { catwayId, catwayNumber, type, catwayState } = req.body; // Récupère les données

    try {
        const updatedCatway = await Catway.findByIdAndUpdate(catwayId, { catwayNumber, type, catwayState }, { new: true });
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
    const { catwayId } = req.body; // Récupère l'ID du catway

    try {
        await Catway.findByIdAndDelete(catwayId);
        res.redirect('/dashboard?message=Catway supprimé avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?message=Erreur lors de la suppression du catway');
    }
});

// Route pour modifier une réservation
app.post('/reservations/update', async (req, res) => {
    const { reservationId, clientName, boatName, checkIn, checkOut } = req.body; // Récupère les données

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
    const { reservationId } = req.body; // Récupère l'ID de la réservation

    try {
        await Reservation.findByIdAndDelete(reservationId);
        res.redirect('/reservations/list?message=Réservation supprimée avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/reservations/list?message=Erreur lors de la suppression de la réservation');
    }
});


// Route pour enregistrer une réservation sans authentification
app.post('/reservations', async (req, res) => {
    const { clientName, boatName, checkIn, checkOut, catwayNumber } = req.body; // Assure-toi de collecter toutes les données nécessaires

    try {
        const newReservation = new Reservation({
            clientName,
            boatName,
            checkIn,
            checkOut,
            catwayNumber,
            status: 'Confirmée', // Si tu veux un statut par défaut
        });
        await newReservation.save();
        res.status(201).json({ message: 'Réservation ajoutée avec succès.', reservation: newReservation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la réservation.' });
    }
});
