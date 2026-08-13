const express = require('express');
const controller = require('../controllers/salesController');

const router = express.Router();

router.get('/table', controller.getSalesTable);

module.exports = router;
