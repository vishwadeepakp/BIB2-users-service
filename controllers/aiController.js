const service = require("../services/aiService");

exports.sendText = async (req, res, next) => {
    console.log("req.body", req.body)
    try {
        const user = await service.parseVoiceText(req.body);

        res.status(201).json({ data: user, status: true });
    } catch (err) {
        next(err)
    }
};