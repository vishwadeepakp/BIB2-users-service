const { DataTypes } = require("sequelize");
const database = require("../config/database");

const sequelize = database.getConnection();

const User = sequelize.define("User", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },

  mobile: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    index: true,
  },

  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  refcode: {
    type: DataTypes.STRING,
  },

  transactionId: {
    type: DataTypes.STRING,
  },

  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: "pending",
  }


});

module.exports = User;