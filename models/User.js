const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // L'email doit être unique
        index: true // Indexer le champ email
    },
    password: {
        type: String,
        required: true,
    },
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


