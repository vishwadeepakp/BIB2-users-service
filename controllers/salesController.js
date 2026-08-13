const service = require('../services/salesService');

exports.getSalesTable = async (req, res, next) => {
    try {
        const userID = req.headers['x-user-id'] || req.headers['user-id'] || req.headers['userid'];
        console.log("userID", userID);
        const result = await service.getSalesTableData(userID, req.query);
        res.status(200).json({ data: result.data, pagination: result.pagination, status: true });
    } catch (err) {
        next(err);
    }
};
