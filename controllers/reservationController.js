const Reservation = require('../models/Reservation');


exports.getAllReservationsByCatway = async (req, res) => {
    try {
        const reservations = await Reservation.find({ catwayId: req.params.catwayId }); // Assure-toi que 'catwayId' est le bon champ
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createReservation = async (req, res) => {
    const reservation = new Reservation(req.body);
    try {
        await reservation.save();
        res.status(201).json(reservation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


exports.updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json(reservation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json({ message: 'Reservation deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
