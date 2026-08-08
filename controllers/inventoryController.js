const service = require('../services/inventoryService');

exports.getInventoryTable = async (req, res, next) => {
  const userID = req.headers['x-user-id'] || req.headers['user-id'] || req.headers['userid'];
  console.log("userID", userID);

  try {
    const result = await service.getInventoryTableData(userID, req.query);
    res.status(200).json({ data: result.data, pagination: result.pagination, status: true });
  } catch (err) {
    next(err);
  }
};
