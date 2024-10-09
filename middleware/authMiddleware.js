function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // L'utilisateur est authentifié, on passe à la suite
    }
    res.redirect('/auth/login'); // Sinon, on le redirige vers la page de connexion
}

module.exports = ensureAuthenticated;