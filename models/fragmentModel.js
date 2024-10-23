const mongoose = require('mongoose');

const fragmentSchema = new mongoose.Schema({
  proteinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Protein', required: true },
  sequence: { type: String, required: true, maxlength: 50, uppercase: true },
  startPosition: { type: Number, required: true },
  endPosition: { type: Number, required: true },
  motifs: [{ type: String }],
  secondaryStructure: { type: String },
  confidenceScores: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
  url: { type: String }
});

const Fragment = mongoose.model('Fragment', fragmentSchema);

module.exports = Fragment;
