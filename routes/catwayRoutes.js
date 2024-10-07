const express = require('express');
const router = express.Router();
const catwayController = require('../controllers/catwayController');

// Routes pour les catways
router.get('/', catwayController.getAllCatways);
router.get('/:id', catwayController.getCatwayById);
router.post('/', catwayController.createCatway);
router.put('/:id', catwayController.updateCatway);
router.delete('/:id', catwayController.deleteCatway);

module.exports = router;
