const service = require('../services/profileService');


exports.saveProfile = async (req, res, next) => {
    try {
        const userID = req.headers['x-user-id'] || req.headers['user-id'] || req.headers['userid'];
        console.log("userID", userID);
        const data = req.body;
        const result = await service.saveOrUpdateStoreProfile(userID, data);
        res.status(201).json({ data: result, status: true });
    } catch (err) {
        console.log("profile err", err);
        next(err);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const userID = req.headers['x-user-id'] || req.headers['user-id'] || req.headers['userid'];
        console.log("userID", userID);
        const result = await service.getStoreProfileByUserId(userID);
        res.status(200).json({ data: result, status: true });
    } catch (err) {
        console.log("profile err", err);
        next(err);
    }
};
