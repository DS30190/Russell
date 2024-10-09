const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Assure-toi que le chemin est correct

// Configuration de la stratégie locale
passport.use(new LocalStrategy(
    {
        usernameField: 'email', // Champ à utiliser comme identifiant
        passwordField: 'password' // Champ à utiliser pour le mot de passe
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Utilisateur non trouvé.' });
            }
            const isMatch = await user.comparePassword(password); // Assure-toi d'avoir une méthode pour comparer le mot de passe
            if (!isMatch) {
                return done(null, false, { message: 'Mot de passe incorrect.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;

