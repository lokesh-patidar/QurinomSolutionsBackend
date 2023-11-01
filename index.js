const express = require('express');
const cors = require("cors");
const { connection } = require('./Config/database');
const userRoutes = require('./Routes/userRoutes');
const { ErrorMiddleware } = require('./Middleware/Error');
const sls = require('serverless-http');
const productRoutes = require('./Routes/productRoutes');
const app = express();

app.use(express.json());

app.use(cors({
    origin: "*"
}));

app.get("/", (req, res) => {
    res.send({ Message: "Welcome to Qurinom Solutions" });
});

// Routes
app.use(userRoutes);
app.use(productRoutes);


app.listen(process.env.PORT || 4700, async () => {
    try {
        await connection;
        console.log(`Connected to the Database at ${process.env.PORT}`);
    }
    catch (err) {
        console.log(err);
        console.log("Connection Failed!");
    }
    console.log(`Server is running...`);
});

app.use(ErrorMiddleware);

module.exports.handler = sls(app);