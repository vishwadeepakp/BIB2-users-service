const express = require("express");

const morgan = require("morgan");

const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const cookieParser = require('cookie-parser');

const app = express();

app.use(morgan("dev"));

app.use(express.json());
app.use(cookieParser());

app.use("/users", userRoutes);
app.use("/ai", aiRoutes);
app.use("/ai/inventory", inventoryRoutes);


app.use((err, req, res, next)=>{
    console.error("Error in User Service:", err);
    const statusCode =  err.statusCode || 500;
    const message = err.message || 'Internal Server Error in User Service';
    res.status(statusCode).json({ error: message });
});

module.exports = app;