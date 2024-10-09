const mongoose = require('mongoose');

const catwaySchema = new mongoose.Schema({
  catwayId: { type: String, required: true, unique: true },
  catwayNumber: { type: Number, required: true }, 
  type: { type: String, required: true },          
  catwayState: { type: String, required: true },   
  name: String,          
  capacity: Number,     
  availability: Boolean  
});

module.exports = mongoose.model('Catway', catwaySchema);

