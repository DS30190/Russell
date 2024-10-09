const Catway = require('../models/Catway');


exports.getAllCatways = async (req, res) => {
    try {
        const catways = await Catway.find();
        res.json(catways);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getCatwayById = async (req, res) => {
    try {
        const catway = await Catway.findById(req.params.id);
        if (!catway) return res.status(404).json({ message: 'Catway not found' });
        res.json(catway);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCatway = async (req, res) => {
    const catway = new Catway(req.body);
    try {
        await catway.save();
        res.status(201).json(catway);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateCatway = async (req, res) => {
    try {
        const catway = await Catway.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!catway) return res.status(404).json({ message: 'Catway not found' });
        res.json(catway);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


exports.deleteCatway = async (req, res) => {
    try {
        const catway = await Catway.findByIdAndDelete(req.params.id);
        if (!catway) return res.status(404).json({ message: 'Catway not found' });
        res.json({ message: 'Catway deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
