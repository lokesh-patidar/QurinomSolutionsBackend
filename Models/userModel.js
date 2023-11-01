const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        default: null,
        unique: true,
        required: [true, 'Username is required!'],
    },
    email: {
        type: String,
        default: null,
        unique: true,
        required: [true, 'Email is required!'],
    },
    password: {
        type: String,
        default: null,
        unique: true,
        required: [true, 'Password is required!'],
    },
}, { timestamps: true });


const UserModel = mongoose.model('User', userSchema);

module.exports = { UserModel };