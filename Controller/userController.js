const { UserModel } = require("../Models/userModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { catchError } = require('../Middleware/CatchError');
const ErrorHandler = require("../Utils/ErrorHandler");
const { config } = require("dotenv");
config();


exports.register = catchError(async (req, res, next) => {
    const { userName, email, password } = req.body;
    console.log({ userName, email, password });
    const existingUser = await UserModel.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
        return next(new ErrorHandler('User with the same email or username already exists.', 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10); // You can adjust the salt rounds (e.g., 10) for security
    const newUser = new UserModel({
        userName,
        email,
        password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ success: true, message: 'User registered successfully', user: newUser });
});


exports.login = catchError(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return next(new ErrorHandler('Invalid password', 401));
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRETE, { expiresIn: '1y' });
    res.status(200).json({ success: true, message: 'Login successful', token, user });
});


exports.getMyProfile = catchError(async (req, res, next) => {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }
    res.status(200).json({ "success": true, message: 'My Profile', user });
});


exports.deleteUser = catchError(async (req, res, next) => {
    const id = req.params.userId;
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
        return res.status(404).json({ error: 'User not found!' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully!', user: deletedUser });
});
