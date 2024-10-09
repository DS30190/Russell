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

// Créer un nouveau catway
router.post('/', async (req, res) => {
  const { name, location, capacity } = req.body; // Assurez-vous de collecter les données nécessaires

  try {
    const newCatway = new Catway({ name, location, capacity }); // Créer un nouvel objet Catway
    await newCatway.save(); // Sauvegarder dans la base de données
    res.status(201).json(newCatway); // Renvoie le catway créé
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création du catway' });
  }
});

// Modifier un catway par son ID
router.put('/:id', async (req, res) => {
  const { name, location, capacity } = req.body; // Récupérer les données à modifier

  try {
    const updatedCatway = await Catway.findByIdAndUpdate(
      req.params.id,
      { name, location, capacity },
      { new: true, runValidators: true } // Retourner le catway mis à jour
    );

    if (!updatedCatway) {
      return res.status(404).json({ message: 'Catway non trouvé' });
    }

    res.json(updatedCatway); // Renvoie le catway mis à jour
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du catway' });
  }
});

// Supprimer un catway par son ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCatway = await Catway.findByIdAndDelete(req.params.id); // Supprimer le catway

    if (!deletedCatway) {
      return res.status(404).json({ message: 'Catway non trouvé' });
    }

    res.json({ message: 'Catway supprimé avec succès' }); // Confirmation de la suppression
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du catway' });
  }
});

module.exports = router;


