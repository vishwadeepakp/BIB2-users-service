const InventoryLog = require('../models/InventoryLog');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const { stockUpdate } = require("../utils/kafka");
const { Op, fn, col } = require('sequelize');

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
  console.log("sale_id", sale_id)
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
      gst_rate: item.gst_rate || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_value: item.discount_value,
      discount_type: item.discount_type,
      total: item.total,
    }));

    // 3. Child SaleItems Table में Bulk Data सेव करें
    const createdItems = await SaleItem.bulkCreate(formattedItems);
    if (payload?.items) {
      await stockUpdate({ userId: userId, products: payload.items, type: 'OUT' }); // Kafka को स्टॉक अपडेट इवेंट भेजो
    }

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

async function getAnalytics(userId, startDate, endDate) {
  try {
    // Base Where Clause
    const whereClause = {
      userId,
      status: {
        [Op.ne]: 'cancelled', // Cancelled sales ko include nahi karenge
      },
    };

    // Date Range Filter (sale_date column par)
    if (startDate && endDate) {
      whereClause.sale_date = {
        [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
        [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
      };
    } else if (startDate) {
      whereClause.sale_date = {
        [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
      };
    } else if (endDate) {
      whereClause.sale_date = {
        [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
      };
    }

    // 1. Calculate Total Revenue (Sabhi active sales ka grand_total)
    const totalRevenueResult = await Sale.findOne({
      attributes: [
        [fn('COALESCE', fn('SUM', col('grand_total')), 0), 'totalAmount'],
      ],
      where: whereClause,
      raw: true,
    });

    // 2. Calculate Amount Received
    // Only completed status aur non-credit payment mode wale transactions
    const paidAmountResult = await Sale.findOne({
      attributes: [
        [fn('COALESCE', fn('SUM', col('grand_total')), 0), 'paidAmount'],
      ],
      where: {
        ...whereClause,
        status: 'completed',
        payment_mode: {
          [Op.ne]: 'credit', // Credit / udhaar transactions ko received se exclude karte hain
        },
      },
      raw: true,
    });

    return {
      totalAmount: parseFloat(totalRevenueResult.totalAmount || 0),
      paidAmount: parseFloat(paidAmountResult.paidAmount || 0),
    };
  } catch (error) {
    console.error('Error in getSalesAnalyticsService:', error);
    throw error;
  }
};

module.exports = { parseTableQuery, getSalesTableData, saveSalesData, getSaleItemData, getAnalytics };
