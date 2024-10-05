const { calculateMolecularWeight, gorSecondaryStructure } = require('./models/proteinModel');

const testSequence = "ACDEFGHIKLMNPQRSTVWY";

const molecularWeight = calculateMolecularWeight(testSequence);
console.log(`Molecular weight of the sequence: ${molecularWeight}`);

const { secondaryStructure, confidenceScores } = gorSecondaryStructure(testSequence);
console.log(`Predicted secondary structure: ${secondaryStructure}`);
console.log(`Confidence scores: ${confidenceScores}`);
