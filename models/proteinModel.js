const mongoose = require('mongoose');

const proteinSchema = new mongoose.Schema({
    name: { type: String, required: true },
    molecularWeight: { type: Number },
    sequenceLength: { type: Number },
    sequenceUrl: { type: String, required: true }, 
    secondaryStructure: { type: String },  
    confidenceScores: [{ type: Number }] 
});

const Protein = mongoose.model('Protein', proteinSchema);

module.exports = Protein;
