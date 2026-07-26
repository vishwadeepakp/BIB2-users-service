const { DataTypes } = require("sequelize");
const database = require("../config/database");

const sequelize = database.getConnection();

const RefreshToken = sequelize.define('RefreshToken', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING, // STRING या INTEGER (बिना किसी foreign key constraint के)
        allowNull: false,
        unique: true, // 1 यूजर की 1 ही एक्टिव रो (Row) रहेगी
    },
    token: {
        type: DataTypes.TEXT, // JWT टोकन बड़ा होता है, इसलिए TEXT सबसे सेफ है
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'refresh_tokens',
    timestamps: true, // createdAt और updatedAt स्वतः मैनेज होंगे
});

module.exports = RefreshToken;