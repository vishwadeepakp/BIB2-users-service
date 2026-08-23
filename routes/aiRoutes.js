const express = require("express");
const controller = require("../controllers/aiController");

const router = express.Router();

router.post("/send-text", controller.sendText);

router.post("/get-gst-details", controller.getGstDetails);

router.post("/save-inventory-data", controller.saveInventoryData);

module.exports = router;