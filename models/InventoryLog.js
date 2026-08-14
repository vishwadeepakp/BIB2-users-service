const { DataTypes } = require("sequelize");
const database = require("../config/database");

const sequelize = database.getConnection();

const InventoryLog = sequelize.define('InventoryLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },

  // AI Extracted Core Fields
  name: {
    type: DataTypes.STRING(255),
    allowNull: false, // Product Name (e.g., "Chini", "Parle-G")
  },
  category: {
    type: DataTypes.STRING(100),
    defaultValue: 'General', // e.g., "Kirana", "Snacks"
  },
  type: {
    type: DataTypes.ENUM('IN', 'OUT'),
    defaultValue: 'IN', // 'IN' = Stock Purchase/Added, 'OUT' = Sale
  },

  // Quantities & Packaging
  quantity: {
    type: DataTypes.DECIMAL(10, 3), // Total Quantity (e.g. 4.000)
    allowNull: true,
  },
  unit: {
    type: DataTypes.STRING(20), // "kg", "gm", "litre", "ml", "piece"
    allowNull: true,
  },
  packageCount: {
    type: DataTypes.INTEGER,
    field: 'package_count', // e.g., 4
    allowNull: true,
  },
  packageUnit: {
    type: DataTypes.STRING(50),
    field: 'package_unit', // "packet", "box", "bag", "bottle"
    allowNull: true,
  },
  supplierName: {
    type: DataTypes.STRING(50),
    field: 'supplier_name',
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING(50),
    field: 'brand',
    allowNull: true,
  },
  quantityPerPackage: {
    type: DataTypes.DECIMAL(10, 3),
    field: 'quantity_per_package', // e.g., 1.000 (1kg per packet)
    allowNull: true,
  },

  // Pricing & Expiry
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'selling_price',
    allowNull: true,
  },
  buyingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'buying_price',
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.DATEONLY, // YYYY-MM-DD
    field: 'expiry_date',
    allowNull: true,
  },

  // AI Generated Tags (JSON Array)
  // Example: ["chini", "sugar", "kirana", "sweet"]
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },

  // Raw Metadata (Context / Audit for AI)
  // rawPrompt: {
  //   type: DataTypes.TEXT,
  //   field: 'raw_prompt', // ओरिजिनल वॉइस प्रॉम्प्ट (e.g. "4 पैकेट चीनी खरीदे")
  //   allowNull: true,
  // },
  voiceResponse: {
    type: DataTypes.TEXT,
    field: 'voice_response', // AI का वापस दिया गया Hinglish जवाब
    allowNull: true,
  }
}, {
  tableName: 'inventory_logs',
  timestamps: true,       // createdAt (किस समय डेटा सेव हुआ) ऑटोमैटिक मिल जाएगा
  updatedAt: false,       // लॉग्स कभी अपडेट नहीं होते
  paranoid: true,        // Soft Delete (deleted_at)
  underscored: true,     // DB में snake_case यूज़ करेगा
  indexes: [
    {
      fields: ['user_id', 'name'],
    },
    {
      fields: ['user_id', 'created_at'],
    }
  ]
});

module.exports = InventoryLog;