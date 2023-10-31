const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        default: null,
        type: String,
    },
    mobileNumber: {
        type: String,
        validate: {
            validator: function (value) {
                return /^[0-9]{10}$/.test(value);
            },
            message: 'Invalid phone number format (should be 10 digits)',
        },
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    profilePic: {
        Url: {
            type: String,
            default: null,
        },
        Bucket: {
            type: String,
            default: null,
        },
        Key: {
            type: String,
            default: null,
        },
    },
    dob: {
        default: null,
        type: String,
    },
    email: {
        type: String,
        default: null,
        unique: true,
    },
    userName: {
        type: String,
        default: null,
        unique: true,
    },
    identifier: {
        type: String,
        default: null,
        unique: true,
    },
    identifier_type: {
        type: String,
        default: null,
        unique: true,
    },
    status: {
        type: String,
        enum: ['Active', 'Banned'],
    },
    profileStatus: {
        type: String,
        enum: ['Private', 'Public'],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    unlockedLevel: [
        {
            level: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Level',
            },
            isRewardCollected: {
                default: false,
                type: Boolean,
            },
        },
    ],
    badge: {
        default: null,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserReward',
    },
    frame: {
        default: null,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserReward',
    },
    medal: {
        default: null,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserReward',
    },
    totalCoins: {
        default: 0,
        type: Number,
    },
    isVip: {
        default: null,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vip',
    },
    likes: {
        count: {
            type: Number,
            default: 0,
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
    },
    views: {
        count: {
            type: Number,
            default: 0,
        },
        viewers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    liveStreams: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Live',
    },
    userXp: {
        type: Number,
        default: 0,
    },
    is_online: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });


const UserModel = mongoose.model('User', userSchema);

module.exports = { UserModel };