const Protein = require('../models/proteinModel'); 
const { calculateMolecularWeight } = require('../utils/proteinUtils'); 
const { saveProteinToS3, getProteinFromS3, deleteProteinFromS3 } = require('../utils/s3Utils');
const { v4: uuidv4 } = require('uuid');
const { buildQuery } = require('../utils/queryUtils');

const Fragment = require('../models/fragmentModel');
const { splitSequenceIntoFragments } = require('../utils/sequenceUtils');

exports.createProtein = async (req, res, next) => {
  const { sequence, name, description, sequenceUrl } = req.body;  

  if (!sequence || sequence.length < 20 || sequence.length > 2000) {
    return res.status(400).json({ error: 'Invalid protein sequence, must be between 20 and 2000 characters long' });
  }

  if (!sequenceUrl) {
    return res.status(400).json({ error: 'sequenceUrl is required' });
  }

  const molecularWeight = calculateMolecularWeight(sequence);
  const newProtein = new Protein({
    name: name || `Protein ${sequence.slice(0, 8)}`,
    sequence: sequence.toUpperCase(),
    molecularWeight,
    sequenceLength: sequence.length,  
    description: description || '',
    sequenceUrl 
  });

  try {
    const savedProtein = await newProtein.save();

    const response = {
      metadata: {
        version: '1.0',
        createdAt: savedProtein.createdAt.toISOString(),  
        updatedAt: savedProtein.updatedAt.toISOString()   
      },
      data: {
        proteinId: savedProtein._id.toString(), 
        name: savedProtein.name,
        sequence: savedProtein.sequence,
        molecularWeight: savedProtein.molecularWeight,
        sequenceLength: savedProtein.sequenceLength,  
        description: savedProtein.description,
        sequenceUrl: savedProtein.sequenceUrl, 
        createdAt: savedProtein.createdAt.toISOString(), 
        updatedAt: savedProtein.updatedAt.toISOString()  
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error in createProtein:', error);
    next(error);
  }
};

exports.getAllProteins = async (req, res, next) => {
  try {
    const proteins = await Protein.find({});
    const response = proteins.map(protein => ({
      proteinId: protein._id.toString(),  
      name: protein.name,
      sequence: protein.sequence,
      molecularWeight: protein.molecularWeight,
      sequenceLength: protein.sequenceLength, 
      description: protein.description,
      sequenceUrl: protein.sequenceUrl,
      createdAt: protein.createdAt.toISOString(), 
      updatedAt: protein.updatedAt.toISOString()   
    }));
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getAllProteins:', error);
    next(error);
  }
};

exports.getProteinById = async (req, res, next) => {
  const { proteinId } = req.params;
  try {
    const protein = await Protein.findById(proteinId);
    if (!protein) {
      return res.status(404).json({ error: `Protein with id ${proteinId} not found` });
    }
    const sequence = await getProteinFromS3(proteinId); 

    const response = {
      metadata: {
        version: '1.0',
        createdAt: protein.createdAt.toISOString(), 
        updatedAt: protein.updatedAt.toISOString()  
      },
      data: {
        proteinId: protein._id.toString(),  
        name: protein.name,
        sequence: sequence,  
        molecularWeight: protein.molecularWeight,
        sequenceLength: protein.sequenceLength, 
        description: protein.description,
        sequenceUrl: protein.sequenceUrl,
        createdAt: protein.createdAt.toISOString(), 
        updatedAt: protein.updatedAt.toISOString()   
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getProteinById:', error);
    next(error);
  }
};

exports.deleteProtein = async (req, res, next) => {
  const { proteinId } = req.params;
  try {
    await Protein.findByIdAndDelete(proteinId); 
    await deleteProteinFromS3(proteinId); 
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteProtein:', error);
    next(error);
  }
};

exports.updateProtein = async (req, res, next) => {
  const { proteinId } = req.params;
  const { name, description } = req.body;
  try {
    const protein = await Protein.findById(proteinId);
    if (!protein) {
      return res.status(404).json({ error: `Protein with id ${proteinId} not found` });
    }

    if (name) protein.name = name;
    if (description) protein.description = description;
    await protein.save();

    const response = {
      metadata: {
        version: '1.0',
        createdAt: protein.createdAt.toISOString(),
        updatedAt: protein.updatedAt.toISOString()
      },
      data: {
        proteinId: protein._id.toString(),
        name: protein.name,
        sequence: protein.sequence,
        molecularWeight: protein.molecularWeight,
        sequenceLength: protein.sequenceLength,
        description: protein.description,
        sequenceUrl: protein.sequenceUrl,
        createdAt: protein.createdAt.toISOString(),
        updatedAt: protein.updatedAt.toISOString()
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in updateProtein:', error);
    next(error);
  }
};

exports.searchProteins = async (req, res, next) => {
  try {
    const query = buildQuery(req.query); 
    const proteins = await Protein.find(query);

    const response = proteins.map(protein => ({
      proteinId: protein._id.toString(),
      name: protein.name,
      sequence: protein.sequence,
      molecularWeight: protein.molecularWeight,
      sequenceLength: protein.sequenceLength,
      description: protein.description,
      sequenceUrl: protein.sequenceUrl,
      createdAt: protein.createdAt.toISOString(),
      updatedAt: protein.updatedAt.toISOString()
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in searchProteins:', error);
    next(error);
  }
};

exports.createFragmentsForProtein = async (req, res, next) => {
  const { proteinId, fragmentSize } = req.body;

  try {
    const protein = await Protein.findById(proteinId);
    if (!protein) {
      return res.status(404).send('Protein not found');
    }

    const fragments = splitSequenceIntoFragments(protein.sequence, fragmentSize);
    const fragmentObjects = fragments.map((seq, index) => ({
      proteinId,
      sequence: seq,
      startPosition: index * fragmentSize,
      endPosition: (index + 1) * fragmentSize - 1,
    }));

    await Fragment.insertMany(fragmentObjects);
    res.status(201).send('Fragments created successfully');
  } catch (error) {
    console.error('Error creating fragments:', error);
    next(error);
  }
};

exports.getFragmentsByProteinId = async (req, res, next) => {
  try {
    const fragments = await Fragment.find({ proteinId: req.params.proteinId });
    res.json(fragments);
  } catch (error) {
    console.error('Error retrieving fragments:', error);
    next(error);
  }
};

