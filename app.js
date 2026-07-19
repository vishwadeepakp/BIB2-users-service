const express = require("express");

const morgan = require("morgan");

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use("/", userRoutes);

app.use((err, req, res, next)=>{
    const statusCode =  err.statusCode || 500;
    const message = err.message || 'Internal Server Error in User Service';
})

module.exports = app;