const { DataTypes } = require("sequelize");
const database = require("../config/database");

const sequelize = database.getConnection();

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: 'Unique Bill/Invoice ID (e.g. INV-2026-0001)',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  customer_gstin: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  payment_mode: {
    type: DataTypes.ENUM('cash', 'upi', 'card', 'bank_transfer', 'credit'),
    defaultValue: 'cash',
  },
  status: {
    type: DataTypes.ENUM('completed', 'pending', 'cancelled'),
    defaultValue: 'completed',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  overall_discount_type: {
    type: DataTypes.ENUM('percent', 'fixed'),
    defaultValue: 'fixed',
  },
  overall_discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  overall_discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  grand_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  sale_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'sales',
  timestamps: true, // createdAt और updatedAt ऑटोमैटिक बन जाएंगे
});

Sale.beforeCreate((sale) => {
  sale.invoice_number = `INV-${Date.now()}`; // उदाहरण: INV-1723747980676
});

module.exports = Sale;