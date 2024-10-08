const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

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
            // Au lieu de définir un message d'erreur, redirige simplement vers dashboard.html
            return res.redirect('/dashboard'); // Redirige vers le tableau de bord
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

module.exports = router;



