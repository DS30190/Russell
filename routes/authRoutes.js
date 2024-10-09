const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Pour le hachage des mots de passe




// Route pour la connexion d'un utilisateur
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); // Passe à l'erreur si quelque chose ne va pas
        }
        if (!user) {
            // Si l'utilisateur n'est pas trouvé ou que les informations sont incorrectes
            return res.status(401).json({ message: 'Identifiants invalides' }); // Renvoie un message d'erreur
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err); // Passe à l'erreur si problème lors de la connexion
            }
            // Redirige vers le tableau de bord après une connexion réussie
            return res.redirect('/dashboard'); // Redirection vers le tableau de bord
        });
    })(req, res, next);
});


// Route pour déconnecter un utilisateur
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/'); // Redirige vers la page d'accueil après déconnexion
    });
});

// Route pour afficher le formulaire de connexion
router.get('/login', (req, res) => {
    res.send('Page de connexion'); // Remplace ceci par le rendu de ton formulaire de connexion
});

module.exports = router;
