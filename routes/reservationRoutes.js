const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController'); 

// Récupérer toutes les réservations pour un catway spécifique
router.get('/:catwayId', reservationController.getAllReservationsByCatway); 

// Récupérer une réservation par son ID pour un catway spécifique
router.get('/:catwayId/:id', reservationController.getReservationById);  

// Créer une réservation pour un catway spécifique
router.post('/:catwayId', reservationController.createReservation); 

// Mettre à jour une réservation pour un catway spécifique
router.put('/:catwayId/:id', reservationController.updateReservation); 

// Supprimer une réservation pour un catway spécifique
router.delete('/:catwayId/:id', reservationController.deleteReservation);  

module.exports = router;



