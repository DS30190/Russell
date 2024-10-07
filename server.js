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

// Connexion à MongoDB (si ce n'est pas déjà fait dans connectDB)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/russell_port', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connecté'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

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



