const express = require('express');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const catwayRoutes = require('./routes/catwayRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const session = require('express-session'); // Pour gérer les sessions
const passport = require('./config/passport'); // Pour l'authentification
const flash = require('connect-flash'); // Pour les messages flash
const Catway = require('./models/Catway'); // Chemin d'accès au modèle Catway
const Reservation = require('./models/Reservation'); // Chemin d'accès au modèle Reservation
const User = require('./models/User'); // Chemin vers le modèle User

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

// Route pour créer un utilisateur
app.post('/auth/create-user', async (req, res) => {
    const { email, password } = req.body; // Récupère les données du formulaire

    try {
        const newUser = new User({ _id: email, password }); // Utiliser email comme ID
        await newUser.save(); // Enregistre le nouvel utilisateur dans la base de données
        res.redirect('/dashboard?message=Utilisateur créé avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?message=Erreur lors de la création de l’utilisateur');
    }
});

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
        const reservations = await Reservation.find().populate('catwayId'); // Récupère toutes les réservations avec les détails des catways
        res.send(`
            <h1>Liste des Réservations</h1>
            <ul>
                ${reservations.map(reservation => `
                    <li>
                        Réservation ID: ${reservation._id} - Catway: ${reservation.catwayId ? reservation.catwayId.catwayNumber : 'Non spécifié'} - Client: ${reservation.clientName}
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
                    <label for="email">Email :</label>
                    <input type="email" id="email" name="email" required autocomplete="off">
                    <br>
                    <label for="password">Mot de passe :</label>
                    <input type="password" id="password" name="password" required autocomplete="off">
                    <br>
                    <button type="submit">Se connecter</button>
                </form>
            </body>
        </html>
    `);
});

// Route pour modifier un utilisateur
app.post('/auth/update-user', async (req, res) => {
    const { userId, email, password } = req.body; // Récupère les données du formulaire

    try {
        const user = await User.findByIdAndUpdate(userId, { email, password }, { new: true });
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
        await User.findByIdAndDelete(userId);
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

// Route pour créer une réservation
app.post('/reservations/create', async (req, res) => {
    const { clientName, boatName, checkIn, checkOut, catwayId } = req.body; // Récupère les données du formulaire

    try {
        const newReservation = new Reservation({
            clientName,
            boatName,
            checkIn,
            checkOut,
            catwayId,
            userId: req.user._id, // Assure-toi que l'utilisateur est connecté
            status: 'Confirmée' // Statut par défaut
        });
        await newReservation.save(); // Enregistre la nouvelle réservation dans la base de données
        res.redirect('/reservations/list?message=Réservation créée avec succès');
    } catch (error) {
        console.error(error);
        res.redirect('/reservations/list?message=Erreur lors de la création de la réservation');
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
