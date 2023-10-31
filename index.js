const express = require('express');
const cors = require("cors");
const { connection } = require('./Config/database');
const userRoutes = require('./Routes/userRoutes');
const { ErrorMiddleware } = require('./Middleware/Error');
const sls = require('serverless-http');
const app = express();
const http = require('http');
const path = require('path');

app.use(express.json());
app.use(cors({
    origin: "*"
}));

app.use(express.static(path.resolve("./public")))

app.get("/", (req, res) => {
    res.send({ Message: "Welcome to Live Streaming" });
});

// Routes
app.use(userRoutes);

app.listen(process.env.PORT || 4500, async () => {
    try {
        await connection;
        console.log("Connected to the Database");
    }
    catch (err) {
        console.log(err);
        console.log("Connection Failed!");
    }
    console.log(`Server is running...`);
});

app.use(ErrorMiddleware);

module.exports.handler = sls(app);