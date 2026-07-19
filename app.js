const express = require("express");

const morgan = require("morgan");

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use("/", userRoutes);

app.use((err, req, res, next)=>{
    console.error("Error in User Service:", err);
    const statusCode =  err.statusCode || 500;
    const message = err.message || 'Internal Server Error in User Service';
    res.status(statusCode).json({ error: message });
});

module.exports = app;