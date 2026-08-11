const service = require("../services/aiService");

exports.sendText = async (req, res, next) => {
    console.log("req.body", req.body)
    const userID = req.headers['x-user-id'];
    try {
        const user = await service.parseVoiceText(req.body, userID);

        res.status(201).json({ data: user, status: true });
    } catch (err) {
        next(err)
    }
};

exports.saveInventoryData = async (req, res, next) => {
    try {
        console.log("req", req.headers['x-user-id']);
        const userID = req.headers['x-user-id'];
        
        const user = await service.saveInventory([req.body], userID);

        res.status(201).json({ data: user, status: true });
    } catch (err) {
        next(err)
    }
};