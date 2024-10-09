const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    reservationId: { type: String, required: true, unique: true }, 
    catwayNumber: { type: Number, required: true },
    clientName: { type: String, required: true },
    boatName: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;




