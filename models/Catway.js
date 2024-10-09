const mongoose = require('mongoose');

const catwaySchema = new mongoose.Schema({
  catwayId: { type: String, required: true, unique: true },
  catwayNumber: { type: Number, required: true }, // Ajoutez le numéro du catway
  type: { type: String, required: true },          // Ajoutez le type du catway
  catwayState: { type: String, required: true },   // Ajoutez l'état du catway
  name: String,          // Nom du catway
  location: String,      // Localisation
  capacity: Number,      // Capacité du catway
  availability: Boolean  // Disponibilité
});

module.exports = mongoose.model('Catway', catwaySchema);

