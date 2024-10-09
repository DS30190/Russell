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
  const { clientName, boatName, checkIn, checkOut, catwayId } = req.body; // Assurez-vous de récupérer tous les champs nécessaires

  try {
    // Créez une nouvelle instance de la réservation avec les données fournies
    const newReservation = new Reservation({
      clientName,
      boatName,
      checkIn,
      checkOut,
      catwayId, // Assurez-vous que catwayId correspond au champ correct dans votre modèle
      status: 'Confirmée', // Définit un statut par défaut
    });

    await newReservation.save();
    res.status(201).json({ message: 'Réservation créée avec succès', reservation: newReservation });
  } catch (error) {
    console.error(error); // Affiche l'erreur dans la console pour le débogage
    res.status(400).json({ message: 'Erreur lors de la création de la réservation' });
  }
});

// Mettre à jour une réservation par son ID
router.put('/:id', async (req, res) => {
  const { clientName, boatName, checkIn, checkOut, catwayId } = req.body;

  try {
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { clientName, boatName, checkIn, checkOut, catwayId },
      { new: true, runValidators: true } // Retourner la réservation mise à jour
    );

    if (!updatedReservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    res.json(updatedReservation); // Renvoie la réservation mise à jour
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de la réservation' });
  }
});

// Supprimer une réservation par son ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedReservation = await Reservation.findByIdAndDelete(req.params.id); // Supprimer la réservation

    if (!deletedReservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    res.json({ message: 'Réservation supprimée avec succès' }); // Confirmation de la suppression
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la réservation' });
  }
});

module.exports = router;






