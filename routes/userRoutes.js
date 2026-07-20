const express = require("express");
const controller = require("../controllers/userController");

const router = express.Router();

router.post("/register", controller.create);

router.get("/", controller.findAll);

router.get("/:id", controller.findOne);

router.put("/:id", controller.update);

router.delete("/:id", controller.remove);

router.post("/send-otp", controller.sendOtp);

module.exports = router;