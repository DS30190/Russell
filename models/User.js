const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Utilisation de l'email comme ID
    password: { type: String, required: true }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

// Hash le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;


