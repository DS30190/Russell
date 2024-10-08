const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Pour le hachage des mots de passe

// Route pour l'inscription d'un utilisateur
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        user = new User({ email, password });
        await user.save();
        res.status(201).json({ message: 'Utilisateur enregistré avec succès.' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});


// Route pour la connexion d'un utilisateur
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); // Passe à l'erreur si quelque chose ne va pas
        }
        if (!user) {
            // Si l'utilisateur n'est pas trouvé ou que les informations sont incorrectes
            return res.status(401).send('Identifiants invalides'); // Vous pouvez envoyer un message d'erreur
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err); // Passe à l'erreur si problème lors de la connexion
            }
            return res.redirect('/dashboard'); // Redirige vers le tableau de bord après connexion
        });
    })(req, res, next);
});


// Route pour déconnecter un utilisateur
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/'); // Redirige vers la page d'accueil après déconnexion
    });
});

// Route d'inscription
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Utilisateur déjà existant');
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).send('Inscription réussie');
    } catch (error) {
        res.status(500).send('Erreur lors de l\'inscription');
    }
});

module.exports = router;



