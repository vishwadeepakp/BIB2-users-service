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

exports.saveSalesData = async (req, res, next) => {
    try {
        const userID = req.headers['x-user-id'] || req.headers['user-id'] || req.headers['userid'];
        const data = req.body;
        const result = await service.saveSalesData(userID, data);
        res.status(201).json({ data: result, status: true });
    } catch (err) {
        next(err);
    }
};

exports.getItems = async (req, res, next) => {
    try {
        const sale_id = req.query.saleId;
        console.log("sale_id", sale_id);
        const result = await service.getSaleItemData(sale_id);
        res.status(200).json({ data: result, status: true });
    } catch (err) {
        next(err);
    }
};

exports.getAnalytics = async (req, res, next) => {
    try {
        const userID = req.headers['x-user-id'] || req.headers['user-id'] || req.headers['userid'];
        const { startDate, endDate } = req.query;
        const result = await service.getAnalytics(userID, startDate, endDate);
        res.status(201).json({ data: result, status: true });
    } catch (err) {
        next(err);
    }
};
