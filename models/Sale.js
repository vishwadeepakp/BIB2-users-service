const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // आपका Sequelize instance

const Sale = sequelize.define('Sale', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  invoiceNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
  customerName: { type: DataTypes.STRING, defaultValue: 'Walk-in' },
  customerPhone: { type: DataTypes.STRING },
  
  // Totals
  subTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  totalDiscount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  taxAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  grandTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

  // Payments
  paymentMode: { type: DataTypes.ENUM('CASH', 'UPI', 'CARD', 'CREDIT'), defaultValue: 'CASH' },
  amountPaid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  dueAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  paymentStatus: { type: DataTypes.ENUM('PAID', 'PARTIAL', 'UNPAID'), defaultValue: 'PAID' },
  
  notes: { type: DataTypes.TEXT }
});

module.exports = Sale;