const express = require('express');
const controller = require('../controllers/inventoryController');

const router = express.Router();

router.get('/table', controller.getInventoryTable);
router.post('/save-ocr-data', controller.saveOcrData);

module.exports = router;
