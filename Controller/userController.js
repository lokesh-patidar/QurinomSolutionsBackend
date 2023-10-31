const { UserModel } = require("../Models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { catchError } = require('../Middleware/CatchError');
const ErrorHandler = require("../Utils/ErrorHandler");
const { config } = require("dotenv");
config();


const register = catchError(async (req, res, next) => {
    const { mobileNumber } = req.body;
    const hashedMobileNumber = await bcrypt.hash(mobileNumber, 10);
    let user = await UserModel.findOne({ mobileNumber });
    if (user) {
        return next(new ErrorHandler('Mobile no. is already registered with us', 400));
    }
    user = new UserModel({
        mobileNumber,
        status: 'Active',
        role: 'user',
        profileStatus: 'Public',
        email: hashedMobileNumber,
        userName: hashedMobileNumber,
    });
    const savedUser = await user.save();
    const userForSend = {
        "fullName": savedUser.fullName,
        "mobileNumber": savedUser.mobileNumber,
        "dob": savedUser.dob,
        "email": null,
        "userName": null,
        "status": savedUser.status,
        "profileStatus": savedUser.profileStatus,
        "role": savedUser.role,
        "followers": [],
        "following": [],
        "badge": null,
        "frame": null,
        "medal": null,
        "views": savedUser.views,
        "totalCoins": 0,
        "isVip": null,
        "userXp": 0,
        "_id": savedUser._id,
        "unlockedLevel": [],
        "createdAt": savedUser.createdAt,
        "updatedAt": savedUser.updatedAt,
        "__v": 0
    }
    return res.status(201).send({ "success": true, message: 'User Registered Successfully', user: userForSend });
});


const adminRegister = catchError(async (req, res, next) => {
    const { mobileNumber } = req.body;
    const hashedMobileNumber = await bcrypt.hash(mobileNumber, 10);
    let user = await UserModel.findOne({ mobileNumber });
    if (user) {
        return next(new ErrorHandler('Mobile no. is already registered with us', 400));
    }
    user = new UserModel({
        mobileNumber,
        status: 'Active',
        role: 'admin',
        profileStatus: 'Public',
        email: hashedMobileNumber,
        userName: hashedMobileNumber,
    });
    const savedUser = await user.save();
    const userForSend = {
        "fullName": savedUser.fullName,
        "mobileNumber": savedUser.mobileNumber,
        "dob": savedUser.dob,
        "email": null,
        "userName": null,
        "status": savedUser.status,
        "profileStatus": savedUser.profileStatus,
        "role": savedUser.role,
        "followers": [],
        "following": [],
        "badge": null,
        "frame": null,
        "medal": null,
        "views": savedUser.views,
        "totalCoins": 0,
        "isVip": null,
        "userXp": 0,
        "_id": savedUser._id,
        "unlockedLevel": [],
        "createdAt": savedUser.createdAt,
        "updatedAt": savedUser.updatedAt,
        "__v": 0
    }
    return res.status(201).send({ "success": true, message: 'Admin Registered Successfully', user: userForSend });
});


const loginUser = catchError(async (req, res, next) => {

    const { mobileNumber, identifier, identifier_type } = req.body;
    console.log({ mobileNumber, identifier, identifier_type });

    if (!mobileNumber && !identifier && !identifier_type) {
        return next(new ErrorHandler('Login credential is required', 400));
    };

    if (mobileNumber) {
        const existingUserWithMobileNo = await UserModel.findOne({ mobileNumber });
        if (existingUserWithMobileNo) {
            console.log({ existingUserWithMobileNo });
            const token = jwt.sign({ user: existingUserWithMobileNo }, process.env.JWT_SECRET || 'liveStreamingSecretKey', {
                expiresIn: '1y',
            });
            res.json({ "success": true, message: 'Login successful!', token, user: existingUserWithMobileNo });
        };
    };

    if (identifier && identifier_type) {
        const existingUserWithIdentifierType = await UserModel.findOne({ identifier_type, identifier });
        if (existingUserWithIdentifierType) {
            console.log({ existingUserWithIdentifierType });
            const token = jwt.sign({ user: existingUserWithIdentifierType }, process.env.JWT_SECRET || 'liveStreamingSecretKey', {
                expiresIn: '1y',
            });
            console.log("inside identifier type if existing user is present");
            return res.status(201).send({ "success": true, message: 'Login successful!',id: existingUserWithIdentifierType._id, token, user: existingUserWithIdentifierType });
        }
        else {
            console.log('identifier and type not present so new creating');
            const hashedString = await bcrypt.hash(mobileNumber || identifier || identifier_type, 10);
            const user = new UserModel({
                mobileNumber,
                status: 'Active',
                role: 'user',
                profileStatus: 'Public',
                email: hashedString,
                userName: hashedString,
                identifier,
                identifier_type,
            });
            const savedUser = await user.save();
            const userForSend = {
                "fullName": savedUser.fullName,
                "mobileNumber": savedUser.mobileNumber,
                "dob": savedUser.dob,
                "email": null,
                "userName": null,
                "status": savedUser.status,
                "profileStatus": savedUser.profileStatus,
                "role": savedUser.role,
                "identifier": savedUser.identifier,
                "identifier_type": savedUser.identifier_type,
                "followers": [],
                "following": [],
                "badge": null,
                "frame": null,
                "medal": null,
                "views": savedUser.views,
                "totalCoins": 0,
                "isVip": null,
                "userXp": 0,
                "_id": savedUser._id,
                "unlockedLevel": [],
                "createdAt": savedUser.createdAt,
                "updatedAt": savedUser.updatedAt,
                "__v": 0
            }
            const token = jwt.sign({ user: savedUser }, process.env.JWT_SECRET || 'liveStreamingSecretKey', {
                expiresIn: '1y',
            });
            return res.status(201).send({ "success": true,id: userForSend._id, message: 'Login successful!', token, user: userForSend });
        };
    };
    return next(new ErrorHandler('User not found', 404));
});


const adminLogin = catchError(async (req, res, next) => {
    const { mobileNumber } = req.body;
    const user = await UserModel.findOne({ mobileNumber });
    if (!user) {
        return next(new ErrorHandler('Mobile number does not exist!', 404));
    }
    if (user?.role !== 'admin') {
        return next(new ErrorHandler('Only admins can have the login access for this panel!', 400));
    }
    const token = jwt.sign({ user }, process.env.JWT_SECRET || 'liveStreamingSecretKey', {
        expiresIn: '1y',
    });
    res.json({ "success": true, message: 'Login successful!', token, user });
});


function isHashed(value) {
    // Replace this regex pattern with the one that matches your hashed format
    const bcryptHashPattern = /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9/.]{53}$/;
    return bcryptHashPattern.test(value);
}


const getAllUsers = catchError(async (req, res, next) => {
    const users = await UserModel.find()
        .populate([
            {
                path: 'unlockedLevel.level',
                select: 'color level xpLevel rewards',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
            {
                path: 'likes.users',
                select: 'fullName userName role profilePic',
                model: 'User',
            },
            {
                path: 'followers',
                select: 'fullName userName profileStatus profilePic',
            },
            {
                path: 'following',
                select: 'fullName userName profileStatus profilePic',
            },
            {
                path: 'views.viewers',
                select: 'fullName userName profileStatus profilePic',
                model: 'User',
            },
            {
                path: 'frame',
                select: 'isExpiredAt rewards inUse',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
            {
                path: 'badge',
                select: 'isExpiredAt rewards inUse',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
            {
                path: 'medal',
                select: 'isExpiredAt rewards inUse',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
        ]);
    const modifiedUsers = users.map(user => {
        if (isHashed(user.userName)) {
            user.userName = null;
        }
        if (isHashed(user.email)) {
            user.email = null;
        }
        return user;
    });
    res.status(200).json({ "success": true, message: 'All Users', users: modifiedUsers });
});


const getUserById = catchError(async (req, res, next) => {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId)
        .populate([
            {
                path: 'unlockedLevel.level',
                select: 'color level xpLevel rewards',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
            {
                path: 'likes.users',
                select: 'fullName userName role profilePic',
                model: 'User',
            },
            {
                path: 'followers',
                select: 'fullName userName profileStatus profilePic',
            },
            {
                path: 'following',
                select: 'fullName userName profileStatus profilePic',
            },
            {
                path: 'views.viewers',
                select: 'fullName userName profileStatus profilePic',
                model: 'User',
            },
            {
                path: 'frame',
                select: 'isExpiredAt rewards inUse',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
            {
                path: 'badge',
                select: 'isExpiredAt rewards inUse',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
            {
                path: 'medal',
                select: 'isExpiredAt rewards inUse',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
        ]);
    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }
    if (isHashed(user.userName)) {
        user.userName = null;
    }
    if (isHashed(user.email)) {
        user.email = null;
    }
    res.status(200).json({ "success": true, message: 'User by id', user });
});


const getMyProfile = catchError(async (req, res, next) => {
    const userId = req.user._id;
    const user = await UserModel.findById(userId)
        .populate([
            {
                path: 'unlockedLevel.level',
                select: 'color level xpLevel rewards',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
            {
                path: 'likes.users',
                select: 'fullName userName role profilePic',
                model: 'User',
            },
            {
                path: 'followers',
                select: 'fullName userName profileStatus profilePic',
            },
            {
                path: 'following',
                select: 'fullName userName profileStatus profilePic',
            },
            {
                path: 'views.viewers',
                select: 'fullName userName profileStatus profilePic',
                model: 'User',
            },
            {
                path: 'frame',
                select: 'isExpiredAt rewards inUse',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
            {
                path: 'badge',
                select: 'isExpiredAt rewards inUse',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
            {
                path: 'medal',
                select: 'isExpiredAt rewards inUse',
                populate: {
                    path: 'rewards',
                    select: 'image type name'
                },
            },
        ]);
    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }
    if (isHashed(user.userName)) {
        user.userName = null;
    }
    if (isHashed(user.email)) {
        user.email = null;
    }
    res.status(200).json({ "success": true, message: 'My Profile', user });
});


const deleteUser = catchError(async (req, res, next) => {
    const currentUserRole = req.user.role;
    const id = req.params.userId;
    console.log({ currentUserRole, id });
    if (currentUserRole !== 'admin') {
        return next(new ErrorHandler('You can not delete other users', 400));
    }
    const deletedUser = await UserModel.findByIdAndDelete(id);
    console.log({ deletedUser });
    if (!deletedUser) {
        return res.status(404).json({ error: 'User not found!' });
    }
    res.status(200).json({ message: 'User deleted successfully!', user: deletedUser });
});


// const deleteUser = catchError(async (req, res, next) => {
//     const id = req.params.userId;
//     const deletedUser = await UserModel.findByIdAndDelete(id);
//     if (!deleteUser) {
//         return res.status(404).json({ "success": false, message: 'User not found!' });
//     }
//     res.status(200).json({ "success": true, message: 'User deleted successfully!', user: deletedUser });
// });


const updateUser = catchError(async (req, res, next) => {
    const author = req.user._id;
    const role = req.user.role;
    const userId = req.params.userId;
    const { fullName, email, gender, dob, userName, } = req.body; // Updated user data in the request body

    if (!author.equals(userId) && role !== 'admin') {
        return next(new ErrorHandler('You can not update any other user!', 400));
    }
    const user = await UserModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found!", 404));
    }
    const newUser = {
        fullName: user.fullName,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
        password: user.password,
        userName: user.userName,
        profilePic: user.profilePic,
    };
    if (user.fullName !== fullName) {
        newUser['fullName'] = fullName;
    }
    if (user.email !== email) {
        newUser['email'] = email;
    }
    if (user.gender !== gender) {
        newUser['gender'] = gender;
    }
    if (newUser.dob !== dob) {
        newUser['dob'] = dob;
    }
    if (newUser.userName !== userName) {
        newUser['userName'] = userName;
    }
    if (req.s3FileUrl) {
        console.log({ file: req.s3FileUrl });
        newUser.profilePic = req.s3FileUrl;
    }
    const updatedUser = await UserModel.findByIdAndUpdate(userId, newUser, { new: true });
    if (!updatedUser) {
        return next(new ErrorHandler('User not found!', 404));
    }
    if (isHashed(updatedUser.userName)) {
        updatedUser.userName = null;
    }
    if (isHashed(updatedUser.email)) {
        updatedUser.email = null;
    }
    res.status(200).json({ "success": true, message: 'User updated successfully', user: updatedUser });
});


// Follow a user
const followUser = catchError(async (req, res, next) => {
    const userId = req.params.userId;
    const currentUserId = req.user._id;
    const userToFollow = await UserModel.findById(userId);
    const currentUser = await UserModel.findById(currentUserId);
    if (currentUserId.equals(userId)) {
        return next(new ErrorHandler('You can not follow yourself', 400));
    }
    if (!userToFollow) {
        return next(new ErrorHandler('User not found', 404));
    }
    if (userToFollow.followers.some(follower => follower.equals(currentUserId))) {
        return next(new ErrorHandler(`You are already following ${userToFollow?.fullName}`, 400));
    }
    currentUser.following.push(userId);
    await currentUser.save();
    userToFollow.followers.push(currentUserId);
    await userToFollow.save();
    res.json({ "success": true, message: `You are now following ${userToFollow?.fullName}`, currentUser, userToFollow });
});


// Un-follow a user
const unFollowUser = catchError(async (req, res, next) => {
    const userIdToUnfollow = req.params.userId;
    const currentUserId = req.user._id;
    const userToUnfollow = await UserModel.findById(userIdToUnfollow);
    const currentUser = await UserModel.findById(currentUserId);
    if (currentUserId.equals(userIdToUnfollow)) {
        return next(new ErrorHandler('You are trying to unfollow yourself!', 400));
    }
    if (!userToUnfollow || !currentUser) {
        return next(new ErrorHandler('User not found', 404));
    }
    currentUser.following = currentUser.following.filter(follow => !follow.equals(userIdToUnfollow));
    userToUnfollow.followers = userToUnfollow.followers.filter(follower => !follower.equals(currentUserId));
    await currentUser.save();
    await userToUnfollow.save();
    res.json({ "success": true, message: `You have unfollowed ${userToUnfollow?.fullName}`, currentUser, userToUnfollow });
});


const changeProfileStatus = catchError(async (req, res, next) => {
    const userId = req.params.userId;
    const currentUser = req.user;
    const { profileStatus } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }
    console.log({ user_id: user._id.toString(), userId, currentUserId: currentUser._id });
    if (currentUser?.role !== 'admin' && user._id.toString() !== currentUser._id?.toString()) {
        return next(new ErrorHandler('You are not authorised to change any other users profile status!', 404));
    }
    if (!profileStatus) {
        return next(new ErrorHandler('Did not get new profile status!', 404));
    }
    user.profileStatus = profileStatus;
    const updatedUser = await user.save();
    if (isHashed(updatedUser.userName)) {
        updatedUser.userName = null;
    }
    if (isHashed(updatedUser.email)) {
        updatedUser.email = null;
    }
    res.status(200).json({ "success": true, message: `Profile status of ${updatedUser?.fullName || 'user'} updated successfully!`, user: updatedUser });
});


const changeUserRole = catchError(async (req, res, next) => {
    const author = req.user._id;
    const authorRole = req.user.role;
    const userId = req.params.userId;
    if (authorRole !== 'admin') {
        return next(new ErrorHandler('Only admins can do this', 400));
    }
    if (author.equals(userId)) {
        return next(new ErrorHandler('You can not change your own role!', 400));
    }
    const { role } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }
    if (!role) {
        return next(new ErrorHandler('Did not get new role!', 400));
    }
    user.role = role;
    const updatedUser = await user.save();
    if (isHashed(updatedUser.userName)) {
        updatedUser.userName = null;
    }
    if (isHashed(updatedUser.email)) {
        updatedUser.email = null;
    }
    res.status(200).json({ "success": true, message: 'User role updated successfully!', user: updatedUser });
});


const banActiveUserFunc = catchError(async (req, res, next) => {
    const author = req.user._id;
    const authorRole = req.user.role;
    const userId = req.params.userId;
    if (authorRole !== 'admin') {
        return next(new ErrorHandler('Only admins can do this', 400));
    }
    const { status } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }
    if (!status) {
        return next(new ErrorHandler('Did not get status!', 400));
    }
    user.status = status;
    const updatedUser = await user.save();
    if (isHashed(updatedUser.userName)) {
        updatedUser.userName = null;
    }
    if (isHashed(updatedUser.email)) {
        updatedUser.email = null;
    }
    res.status(200).json({ "success": true, message: 'User status updated successfully!', user: updatedUser });
});


const getFollowers = catchError(async (req, res, next) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;
    const user = await UserModel.findById(userId).populate('followers', 'profilePic profileStatus fullName userName gender');

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const startIndex = (page - 1) * itemsPerPage;
    const followers = user.followers.slice(startIndex, startIndex + itemsPerPage);

    const modifiedFollowers = followers.map(user => {
        if (isHashed(user.userName)) {
            user.userName = null;
        }
        if (isHashed(user.email)) {
            user.email = null;
        }
        return user;
    });

    const totalPages = Math.ceil(user.followers.length / itemsPerPage);

    res.status(200).json({
        success: true,
        message: 'Followers retrieved successfully',
        followers: modifiedFollowers,
        currentPage: page,
        totalPages: totalPages > 0 ? totalPages : 1,
        itemsPerPage,
    });
});


const getFollowings = catchError(async (req, res, next) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;
    const user = await UserModel.findById(userId).populate('following', 'profilePic profileStatus fullName userName gender');

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const startIndex = (page - 1) * itemsPerPage;
    const followings = user.following.slice(startIndex, startIndex + itemsPerPage);

    const modifiedFollowings = followings.map(user => {
        if (isHashed(user.userName)) {
            user.userName = null;
        }
        if (isHashed(user.email)) {
            user.email = null;
        }
        return user;
    });

    const totalPages = Math.ceil(user.following.length / itemsPerPage);

    res.status(200).json({
        success: true,
        message: 'Following retrieved successfully',
        followings: modifiedFollowings,
        currentPage: page,
        totalPages: totalPages > 0 ? totalPages : 1,
        itemsPerPage,
    });
});


const getMyFriends = catchError(async (req, res, next) => {
    const userId = req.user._id;
    const page = Number(req.query.page) || 1; // Get the requested page number from query parameters (default to page 1)
    const itemsPerPage = 15; // Number of items per page
    const user = await UserModel.findById(userId).populate('following');

    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }

    const skipItems = (page - 1) * itemsPerPage;
    const myFriends = await UserModel.find({
        _id: { $in: user.followers, $in: user.following }, // Users who both follow you and are followed by you
    })
        .select('profilePic fullName profileStatus userName gender')
        .skip(skipItems) // Skip the first 'skipItems' results
        .limit(itemsPerPage); // Limit the number of results to 'itemsPerPage';

    // Count the total number of friends
    const totalFriends = await UserModel.countDocuments({
        _id: { $in: user.followers, $in: user.following },
    });

    const totalPages = Math.ceil(totalFriends / itemsPerPage);

    res.status(200).json({
        success: true,
        message: 'My Friends',
        currentPage: page,
        totalPages: totalPages > 0 ? totalPages : 1,
        friends: myFriends,
        itemsPerPage,
    });
});


const getUserFriends = catchError(async (req, res, next) => {
    const userId = req.params.userId;
    const page = Number(req.query.page) || 1; // Get the requested page number from query parameters (default to page 1)
    const itemsPerPage = 15; // Number of items per page
    const user = await UserModel.findById(userId).populate('following');

    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }

    const skipItems = (page - 1) * itemsPerPage;
    const myFriends = await UserModel.find({
        _id: { $in: user.followers, $in: user.following }, // Users who both follow you and are followed by you
    })
        .select('profilePic fullName profileStatus userName gender')
        .skip(skipItems) // Skip the first 'skipItems' results
        .limit(itemsPerPage); // Limit the number of results to 'itemsPerPage';

    // Count the total number of friends
    const totalFriends = await UserModel.countDocuments({
        _id: { $in: user.followers, $in: user.following },
    });

    const totalPages = Math.ceil(totalFriends / itemsPerPage);

    res.status(200).json({
        success: true,
        message: 'My Friends',
        currentPage: page,
        totalPages: totalPages > 0 ? totalPages : 1,
        friends: myFriends,
        itemsPerPage,
    });
});


const addUserView = catchError(async (req, res, next) => {
    const userId = req.params.userId;
    const viewerId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }
    if (!user.views.viewers.includes(viewerId)) {
        user.views.count += 1;
        user.views.viewers.push(viewerId);
        const updatedUser = await user.save();
        res.status(200).json({ success: true, message: 'Profile Viewed successfully', user: updatedUser });
    }
    else {
        res.status(200).json({ success: true, message: 'View already counted for you' });
    }
});


const getUserViewers = catchError(async (req, res, next) => {
    const userId = req.params.userId;
    const page = Number(req.query.page) || 1; // Get the requested page number from query parameters (default to page 1)
    const itemsPerPage = 30; // Number of viewers per page
    const skip = (page - 1) * itemsPerPage;

    const user = await UserModel.findById(userId)
        .populate({
            path: 'views.viewers',
            select: 'fullName userName role profilePic',
            model: 'User',
        });

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const viewers = user.views.viewers;
    const totalViewers = viewers.length; // Total number of viewers
    const totalPages = Math.ceil(totalViewers / itemsPerPage);

    const paginatedViewers = viewers.slice(skip, skip + itemsPerPage);

    res.status(200).json({
        success: true,
        viewers: paginatedViewers,
        currentPage: page, // Send the current page
        totalPages: totalPages > 0 ? totalPages : 1, // Send the total number of pages
        itemsPerPage, // Send the items per page
    });
});


const LikeUser = catchError(async (req, res, next) => {
    const userId = req.params.userId;
    const likerUserId = req.user._id;

    // Check if the liker has already liked the user
    const user = await UserModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }

    if (user.likes.users.includes(likerUserId)) {
        return next(new ErrorHandler('User already liked!', 400));
    }

    user.likes.count += 1;
    user.likes.users.push(likerUserId);
    await user.save();
    res.status(200).json({ success: true, message: 'User liked successfully', user });
});


const RemoveLike = catchError(async (req, res, next) => {
    const userId = req.params.userId;
    const likerUserId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }
    if (!user.likes.users.includes(likerUserId)) {
        return next(new ErrorHandler('User has not been liked by you!', 400));
    }
    user.likes.count -= 1;
    user.likes.users = user.likes.users.filter((id) => id.toString() !== likerUserId.toString());
    await user.save();
    res.status(200).json({ success: true, message: 'Like removed successfully', user });
});


module.exports = {
    register,
    adminRegister,
    loginUser,
    getAllUsers,
    getUserById,
    deleteUser,
    updateUser,
    followUser,
    unFollowUser,
    changeProfileStatus,
    changeUserRole,
    getFollowers,
    getFollowings,
    getMyProfile,
    adminLogin,
    getMyFriends,
    banActiveUserFunc,
    addUserView,
    getUserViewers,
    getUserFriends,
    LikeUser,
    RemoveLike,
};
