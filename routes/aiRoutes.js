const express = require("express");
const controller = require("../controllers/aiController");

const router = express.Router();

router.post("/send-text", controller.sendText);

module.exports = router;