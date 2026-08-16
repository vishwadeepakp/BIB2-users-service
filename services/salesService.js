const { Op } = require('sequelize');
const InventoryLog = require('../models/InventoryLog');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');

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

async function getSalesTableData(userID, query = {}) {
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
    const safeSearch = search.toLowerCase();
    const searchConditions = [
      { invoice_number: { [Op.like]: `%${safeSearch}%` } },
      { customer_name: { [Op.like]: `%${safeSearch}%` } },
    ];

    where[Op.and] = searchConditions;
  }

  const { rows, count } = await Sale.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    attributes: Object.keys(Sale.rawAttributes),
  });
  const dbData = rows.map(sale => ({
    ...sale.toJSON(),
  })
  )
  console.log("dbData", dbData)

  return {
    data: dbData,
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

async function getSaleItemData(sale_id) {
  const where = { sale_id };
  const items = await SaleItem.findAll({
    where,
    attributes: Object.keys(SaleItem.rawAttributes),
  });

  return items.map(item => item.toJSON());
}

async function saveSalesData(userId, payload) {
  try {
    console.log("payload", payload)

    // 1. Master Sale Data सेव करें
    // (invoice_number अपने आप मॉडल के beforeCreate हुक से जनरेट होकर लग जाएगा)
    const createdSale = await Sale.create({
      userId: userId,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone || null,
      customer_gstin: payload.customer_gstin || null,
      payment_mode: payload.payment_mode,
      status: payload.status,
      notes: payload.notes || null,
      subtotal: payload.summary.subtotal,
      overall_discount_type: payload.summary.overall_discount.type,
      overall_discount_value: payload.summary.overall_discount.value,
      overall_discount_amount: payload.summary.overall_discount.amount,
      grand_total: payload.summary.grand_total,
      sale_date: payload.date || new Date(),
    });

    // 2. Items Array में नई बनी Master Sale की ID अटैच करें
    const formattedItems = payload.items.map(item => ({
      sale_id: createdSale.id, // Parent Sale की ID
      product_name: item.product_name,
      brand_name: item.brand_name || null,
      hsn_code: item.hsn_code || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_value: item.discount_value,
      discount_type: item.discount_type,
      total: item.total,
    }));

    // 3. Child SaleItems Table में Bulk Data सेव करें
    const createdItems = await SaleItem.bulkCreate(formattedItems);

    // 4. Response भेजें
    return {
      sale: createdSale,
      items: createdItems,
    }

  } catch (error) {
    console.error('Error saving sale:', error);
    throw new Error("Error in saving sale :: " + error?.message || 'Failed to save sale');
  }
}

module.exports = { parseTableQuery, getSalesTableData, saveSalesData, getSaleItemData };
