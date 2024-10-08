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


