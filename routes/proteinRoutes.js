const express = require('express');
const router = express.Router();
const { createProtein, deleteProtein, getAllProteins, getProteinById, updateProtein } = require('../controllers/proteinController'); // 确保引入所有需要的控制器函数
const { getProteinFromS3 } = require('../utils/s3Utils');
const { gorSecondaryStructure } = require('../models/proteinModel');
const { generateStructureSVG } = require('../utils/svgUtils');

router.post('/', createProtein);

router.delete('/:proteinId', deleteProtein);

router.put('/:proteinId', updateProtein);

router.get('/', getAllProteins);

router.get('/:proteinId', getProteinById);

router.get('/:proteinId/structure', async (req, res, next) => {
  try {
    const { proteinId } = req.params;
    const proteinData = await getProteinFromS3(proteinId);
    const sequence = proteinData.sequence;

    const { secondaryStructure, confidenceScores } = gorSecondaryStructure(sequence);

    if (req.accepts('json')) {
      return res.status(200).json({ proteinId, sequence, secondaryStructure, confidenceScores });
    } else if (req.accepts('svg')) {
      const svgStructure = generateStructureSVG(sequence, secondaryStructure); // 生成SVG
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.status(200).send(svgStructure);
    } else {
      return res.status(406).json({ error: 'Not Acceptable' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
