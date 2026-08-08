const express = require('express');
const controller = require('../controllers/inventoryController');

const router = express.Router();

router.get('/table', controller.getInventoryTable);

module.exports = router;
