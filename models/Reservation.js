const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  catwayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Catway'  // Référence à la collection Catway
  },
  userId: String,      // ID de l'utilisateur qui fait la réservation
  startDate: Date,     // Date de début de la réservation
  endDate: Date,       // Date de fin de la réservation
  status: String       // Statut de la réservation (en attente, confirmée, annulée, etc.)
});

module.exports = mongoose.model('Reservation', reservationSchema);


