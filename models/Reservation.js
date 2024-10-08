const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  catwayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Catway'  // Référence à la collection Catway
  },
  clientName: { type: String, required: true },   // Nom du client
  boatName: { type: String, required: true },     // Nom du bateau
  checkIn: { type: Date, required: true },        // Date d'arrivée
  checkOut: { type: Date, required: true },       // Date de départ
});

module.exports = mongoose.model('Reservation', reservationSchema);



