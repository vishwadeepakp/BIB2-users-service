const { DataTypes } = require("sequelize");
const database = require("../config/database");

const User = require('./User');

const sequelize = database.getConnection();

const StoreProfile = sequelize.define('StoreProfile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // Foreign Key - Logged in User ID
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true, // 1 User = 1 Store Profile (One-to-One Relation)
    references: {
      model: User, // Foreign Key Target Model
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },

  // Store Basic Info
  storeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tagline: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  merchantName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  businessType: {
    type: DataTypes.ENUM('retail', 'wholesale', 'both'),
    defaultValue: 'retail',
  },

  // Address Details
  addressLine1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  addressLine2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  landmark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    defaultValue: 'Maharashtra',
  },
  stateCode: {
    type: DataTypes.STRING,
    defaultValue: '27',
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Tax & Legal Details
  gstin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pan: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Payment & Banking Info
  upiId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ifsc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  storeImage: {
    type: DataTypes.TEXT('long'), // Base64 image या URL के लिए
    allowNull: true,
  },
}, {
  tableName: 'store_profiles',
  timestamps: true, // createdAt और updatedAt स्वतः मैनेज होंगे
});

// Relationships Define करना (Foreign Key Association)
User.hasOne(StoreProfile, { foreignKey: 'userId', as: 'storeProfile' });
StoreProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = StoreProfile;
