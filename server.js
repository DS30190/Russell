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
const User = require('./models/User'); // Assure-toi que le chemin vers ton modèle User est correct

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
        const newUser = new User({ email, password });
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
app.get('/catway/:id', async (req, res) => {
    const catwayId = req.params.id;
    try {
        // Récupérer le catway par ID depuis la base de données
        const catway = await Catway.findById(catwayId);

        // Vérifier si le catway existe
        if (!catway) {
            return res.status(404).send('<h1>Catway non trouvé</h1>');
        }

        // Afficher les détails du catway dans une page HTML
        res.send(`
        <h1>Détails du Catway</h1>
        <p><strong>Numéro du Catway :</strong> ${catway.catwayNumber}</p>
        <p><strong>Type :</strong> ${catway.type}</p>
        <p><strong>État :</strong> ${catway.catwayState}</p>
        <a href="/catways/list">Retour à la liste des catways</a>
    `);
    } catch (err) {
        console.error(err);
        res.status(500).send('<h1>Erreur serveur</h1>');
    }
});


// Route pour afficher les détails d'une réservation
app.get('/reservation/:id', async (req, res) => {
    const reservationId = req.params.id;
    try {
        const reservation = await Reservation.findById(reservationId).populate('catwayId');
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
                ${catways.map(catway => `<li>${catway.name} (ID: ${catway._id})</li>`).join('')}
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
                        Réservation ID: ${reservation._id} - Catway: ${reservation.catwayId ? reservation.catwayId.name : 'Non spécifié'} - Utilisateur: ${reservation.userId} - Statut: ${reservation.status}
                    </li>`).join('')}
            </ul>
            <a href="/dashboard">Retour au tableau de bord</a>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des réservations.');
    }
});


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


