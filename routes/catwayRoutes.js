const express = require('express');
const router = express.Router();
const Catway = require('../models/Catway');

// Récupérer tous les catways
router.get('/', async (req, res) => {
  try {
    const catways = await Catway.find(); // Récupère tous les catways depuis MongoDB
    res.json(catways);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des catways' });
  }
});

module.exports = router;

