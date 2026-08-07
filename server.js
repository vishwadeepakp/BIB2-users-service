require("dotenv").config();

const app = require("./app");
const database = require("./config/database");

const PORT = process.env.PORT || 3001;

// 1. Vercel/Serverless के लिए Express Middleware
// यह हर API कॉल पर चेक करेगा कि DB कनेक्टेड है या नहीं
app.use(async (req, res, next) => {
  try {
    await database.connect();
    // database.sync() केवल जरूरत पड़ने पर रखें
    next();
  } catch (error) {
    console.error("Database Connection Error:", error);
    res.status(500).json({ error: "Database Connection Failed" });
  }
});

app.get("/", (req, res) => {
    res.send("User Service is alive")
});

module.exports = app;

// 2. Local Machine के लिए Server listening + DB Connect
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    try {
      await database.connect();
      await database.sync();
      app.listen(PORT, () => {
        console.log(`🚀 User Service running locally on port ${PORT}`);
      });
    } catch (err) {
      console.error("Local startup failed:", err);
    }
  })();
}

// Global Error Handlers (जैसे आपके कोड में हैं)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
});