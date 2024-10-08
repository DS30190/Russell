const mongoose = require('mongoose');

const catwaySchema = new mongoose.Schema({
  name: String,          // Nom du catway
  location: String,      // Localisation
  capacity: Number,      // Capacité du catway
  availability: Boolean  // Disponibilité
});

module.exports = mongoose.model('Catway', catwaySchema);

