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
        // Récupérer la réservation par ID depuis la base de données
        const reservation = await Reservation.findById(reservationId).populate('catwayId'); // Remplacez par votre méthode pour peupler les détails du catway

        // Vérifier si la réservation existe
        if (!reservation) {
            return res.status(404).send('<h1>Réservation non trouvée</h1>');
        }

        // Afficher les détails de la réservation dans une page HTML
        res.send(`
            <h1>Détails de la Réservation</h1>
            <p><strong>ID de l'utilisateur :</strong> ${reservation.userId}</p>
            <p><strong>ID du Catway :</strong> ${reservation.catwayId.name} (ID: ${reservation.catwayId._id})</p>
            <p><strong>Date de début :</strong> ${reservation.startDate}</p>
            <p><strong>Date de fin :</strong> ${reservation.endDate}</p>
            <p><strong>Statut :</strong> ${reservation.status}</p>
            <a href="/reservations/list">Retour à la liste des réservations</a>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send('<h1>Erreur serveur</h1>');
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


