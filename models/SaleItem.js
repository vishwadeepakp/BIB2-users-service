const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SaleItem = sequelize.define('SaleItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  // Product ID (Reference)
  productId: { type: DataTypes.STRING, allowNull: false }, 
  
  // Snapshot Data (जरूरी!)
  productName: { type: DataTypes.STRING, allowNull: false }, // अगर कल Product का नाम बदला तो भी बिल का नाम यही रहेगा
  unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // सेल के वक्त जो रेट था
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});

module.exports = SaleItem;