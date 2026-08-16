const express = require('express');
const controller = require('../controllers/profileController');

const router = express.Router();

router.post('/save-profile', controller.saveProfile);
router.get('/get-profile', controller.getProfile);


module.exports = router;
