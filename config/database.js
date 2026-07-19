const { Sequelize } = require("sequelize");
require("dotenv").config();

class Database {
  static instance = null;

  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: "mysql",
        logging: false,

        pool: {
          max: 10,
          min: 2,
          acquire: 30000,
          idle: 10000,
          evict: 1000,
        },

        define: {
          timestamps: true,
          underscored: true,
        },
      }
    );

    Database.instance = this;
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log("✅ Database connected");
    } catch (err) {
      console.error("❌ Database connection failed:", err.message);
      process.exit(1);
    }
  }

  async sync(options = {}) {
    await this.sequelize.sync(options);
    console.log("✅ Database Synced");
  }

  getConnection() {
    return this.sequelize;
  }

  async close() {
    await this.sequelize.close();
  }
}

module.exports = new Database();