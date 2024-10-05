const { saveProteinToS3, getProteinFromS3, deleteProteinFromS3, listProteinsFromS3 } = require('../utils/s3Utils'); // 确保导入了 listProteinsFromS3
const { calculateMolecularWeight, gorSecondaryStructure } = require('../models/proteinModel');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const proteinsFilePath = path.join(__dirname, '../data/proteins.json'); // 确保路径正确

const updateProteinsList = async (proteinId, proteinName) => {
  try {
    const data = fs.readFileSync(proteinsFilePath, 'utf8');
    let proteins = JSON.parse(data);

    proteins.push({ id: proteinId, name: proteinName });

    fs.writeFileSync(proteinsFilePath, JSON.stringify(proteins, null, 2));

    console.log('Proteins list updated');
  } catch (error) {
    console.error('Error updating proteins list:', error);
  }
};

const removeProteinFromList = async (proteinId) => {
  try {
    const data = fs.readFileSync(proteinsFilePath, 'utf8');
    let proteins = JSON.parse(data);

    proteins = proteins.filter(protein => protein.id !== proteinId);

    fs.writeFileSync(proteinsFilePath, JSON.stringify(proteins, null, 2));

    console.log(`Protein with id ${proteinId} removed from list`);
  } catch (error) {
    console.error('Error removing protein from list:', error);
  }
};

exports.createProtein = async (req, res, next) => {
  const { sequence, name, description } = req.body;

  if (!sequence || sequence.length < 20 || sequence.length > 2000) {
    return res.status(400).json({ error: 'Invalid protein sequence, must be between 20 and 2000 characters long' });
  }

  const newProtein = {
    id: uuidv4(),
    name: name || `Protein ${sequence.slice(0, 8)}`,
    sequence: sequence.toUpperCase(),
    molecularWeight: calculateMolecularWeight(sequence),
    description: description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await saveProteinToS3(newProtein.id, newProtein);

    await updateProteinsList(newProtein.id, newProtein.name);

    res.status(201).json(newProtein);
  } catch (error) {
    console.error('Error in createProtein:', error);
    next(error);
  }
};

exports.getAllProteins = async (req, res, next) => {
  try {
    const proteins = await listProteinsFromS3(); // 从 S3 获取蛋白质列表
    res.json(proteins);
  } catch (error) {
    console.error('Error in getAllProteins:', error);
    next(error);
  }
};

exports.getProteinById = async (req, res, next) => {
  const { proteinId } = req.params;

  try {
    const protein = await getProteinFromS3(proteinId);
    if (!protein) {
      return res.status(404).json({ error: `Protein with id ${proteinId} not found` });
    }

    res.json(protein);
  } catch (error) {
    next(error);
  }
};

exports.deleteProtein = async (req, res, next) => {
  const { proteinId } = req.params;

  try {
    await deleteProteinFromS3(proteinId);
    await removeProteinFromList(proteinId);
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
    let protein = await getProteinFromS3(proteinId);
    if (!protein) {
      return res.status(404).json({ error: `Protein with id ${proteinId} not found` });
    }

    if (name) protein.name = name;
    if (description) protein.description = description;
    protein.updatedAt = new Date().toISOString();

    await saveProteinToS3(proteinId, protein);

    res.json(protein);
  } catch (error) {
    console.error('Error in updateProtein:', error);
    next(error);
  }
};
