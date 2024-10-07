const Reservation = require('../models/Reservation');

// Récupérer toutes les réservations d'un catway spécifique
exports.getAllReservationsByCatway = async (req, res) => {
    try {
        const reservations = await Reservation.find({ catwayId: req.params.catwayId }); // Assure-toi que 'catwayId' est le bon champ
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Récupérer une réservation spécifique
exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Créer une nouvelle réservation
exports.createReservation = async (req, res) => {
    const reservation = new Reservation(req.body);
    try {
        await reservation.save();
        res.status(201).json(reservation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Mettre à jour une réservation
exports.updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json(reservation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Supprimer une réservation
exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json({ message: 'Reservation deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
