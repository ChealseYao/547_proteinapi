const express = require('express');
const router = express.Router();
const fragmentController = require('../controllers/fragmentController');

// router.post('/fragments', fragmentController.createFragment);
// router.get('/fragments', fragmentController.getAllFragments);
router.post('/', fragmentController.createFragment); 
router.get('/', fragmentController.getAllFragments); 
router.get('/fragments/:fragmentId', fragmentController.getFragmentById);
router.put('/fragments/:fragmentId', fragmentController.updateFragment);
router.delete('/fragments/:fragmentId', fragmentController.deleteFragment);

module.exports = router;
