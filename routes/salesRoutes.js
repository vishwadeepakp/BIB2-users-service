const express = require('express');
const controller = require('../controllers/salesController');

const router = express.Router();

router.get('/table', controller.getSalesTable);
router.post('/save-sales-data', controller.saveSalesData);

module.exports = router;
