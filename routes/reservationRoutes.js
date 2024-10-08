const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// Récupérer toutes les réservations
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('catwayId'); // Populer avec les détails du catway
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations' });
  }
});

// Créer une nouvelle réservation
router.post('/', async (req, res) => {
  try {
    const newReservation = new Reservation(req.body);
    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de la réservation' });
  }
});

module.exports = router;




