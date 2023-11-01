const jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/userModel");
const ErrorHandler = require("../Utils/ErrorHandler");
require('dotenv').config();

const AuthValidator = async (req, res, next) => {
    const token = req.header('Authorization');
    if (token) {
        try {
            const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRETE);
            req.user = await UserModel.findById(decoded.userId);
            next();
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                return next(new ErrorHandler("Token expired", 401));
            }
            else {
                return next(new ErrorHandler("Invalid token", 401));
            }
        }
    }
    else {
        return next(new ErrorHandler("Please Login First!", 401));
    }
};

module.exports = { AuthValidator };
