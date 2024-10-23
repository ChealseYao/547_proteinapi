const mongoose = require('mongoose');

const proteinSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 }, 
    description: { type: String, maxlength: 1000 },  
    molecularWeight: { type: Number, required: true }, 
    sequenceLength: { type: Number, required: true },  
    sequenceUrl: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now },  
    updatedAt: { type: Date, default: Date.now }
});

const Protein = mongoose.model('Protein', proteinSchema);

module.exports = Protein;
