const express = require('express');
const controller = require('../controllers/salesController');

const router = express.Router();

router.get('/table', controller.getSalesTable);
router.post('/save-sales-data', controller.saveSalesData);
router.get('/items', controller.getItems);

module.exports = router;
