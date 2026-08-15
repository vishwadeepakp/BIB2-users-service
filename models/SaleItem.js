const { DataTypes } = require("sequelize");
const database = require("../config/database");

const sequelize = database.getConnection();

const Sale = require('./Sale');

const SaleItem = sequelize.define('SaleItem', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  sale_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Sale,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hsn_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  discount_type: {
    type: DataTypes.ENUM('percent', 'fixed'),
    defaultValue: 'percent',
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'sale_items',
  timestamps: true,
});
// Relationships Define करें
Sale.hasMany(SaleItem, { foreignKey: 'sale_id', as: 'items' });
SaleItem.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });


module.exports = SaleItem;