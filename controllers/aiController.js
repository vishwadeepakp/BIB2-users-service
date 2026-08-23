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

exports.getGstDetails = async (req, res, next) => {
    try {
        const { name } = req.body;
        console.log("name", name);
        const gstDetails = await service.getGstDetails({ name });

        res.status(200).json({ data: gstDetails, status: true });
    } catch (err) {
        console.log("getGstDetails err", err.message);
        next(err)
    }
};
