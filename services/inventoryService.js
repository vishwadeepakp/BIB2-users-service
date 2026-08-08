const { Op } = require('sequelize');
const InventoryLog = require('../models/InventoryLog');

function parseTableQuery(query = {}) {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const offset = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    offset,
    search,
  };
}

async function getInventoryTableData(userID, query = {}) {
  const { page, limit, offset, search } = parseTableQuery(query);

  if (!userID) {
    return {
      data: [],
      pagination: {
        page,
        limit,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  const where = { userId: userID };

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { category: { [Op.like]: `%${search}%` } },
      { tags: { [Op.contains]: [search] } },
    ];
  }

  const { rows, count } = await InventoryLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    attributes: ['id', 'name', 'category', 'type', 'quantity', 'unit', 'packageCount', 'packageUnit', 'quantityPerPackage', 'sellingPrice', 'expiryDate', 'tags', 'voiceResponse', 'createdAt'],
  });

  console.log("rows", rows)

  return {
    data: rows,
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      hasNextPage: page < Math.ceil(count / limit),
      hasPrevPage: page > 1,
    },
  };
}

module.exports = { parseTableQuery, getInventoryTableData };
