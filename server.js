require("dotenv").config();

const app = require("./app");
const database = require("./config/database");

const PORT = process.env.PORT || 3001;

(async () => {
  await database.connect();
  await database.sync();

  app.listen(PORT, () => {
    console.log(`🚀 User Service running on port ${PORT}`);
  });
})();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
});