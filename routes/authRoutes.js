const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcrypt'); 




// Route pour la connexion d'un utilisateur
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); 
        }
        if (!user) {
           
            return res.status(401).json({ message: 'Identifiants invalides' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err); 
            }
            
            return res.redirect('/dashboard'); 
        });
    })(req, res, next);
});


// Route pour déconnecter un utilisateur
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/'); 
    });
});

// Route pour afficher le formulaire de connexion
router.get('/login', (req, res) => {
    res.send('Page de connexion'); 
});

module.exports = router;
