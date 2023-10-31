const express = require('express');
const { getAllUsers, deleteUser, updateUser, loginUser, getUserById, register, followUser, unFollowUser, changeProfileStatus, changeUserRole, adminRegister, getFollowers, getFollowings, getMyProfile, adminLogin, getMyFriends, banActiveUserFunc, addUserView, getUserViewers, getUserFriends, LikeUser, RemoveLike } = require('../Controller/userController');
const userRoutes = express.Router();
const { AuthValidator } = require('../Middleware/AuthValidation');
const { imageSingleUpload } = require('../Middleware/ImageUpload');

userRoutes.post('/api/v1/register', imageSingleUpload, register);
userRoutes.post('/api/v1/admin-register', imageSingleUpload, adminRegister);
userRoutes.post('/api/v1/login', imageSingleUpload, loginUser);
userRoutes.post('/api/v1/admin-login', imageSingleUpload, adminLogin);


// ony access when user is authenticated:-
userRoutes.use(AuthValidator);

userRoutes.post('/api/v1/view-user/:userId', imageSingleUpload, addUserView);

userRoutes.get("/api/v1/get-all-users", getAllUsers);
userRoutes.get("/api/v1/get-user-by-id/:userId", getUserById);
userRoutes.get("/api/v1/get-my-profile", getMyProfile);
userRoutes.get("/api/v1/get-users-followers/:userId", getFollowers);
userRoutes.get("/api/v1/get-users-followings/:userId", getFollowings);
userRoutes.get("/api/v1/get-my-friend-list", getMyFriends);
userRoutes.get("/api/v1/get-user-viewers/:userId", getUserViewers);
userRoutes.get("/api/v1/get-user-friends/:userId", getUserFriends);
userRoutes.post('/api/v1/like-user/:userId', imageSingleUpload, LikeUser);
userRoutes.post('/api/v1/remove-like-from-user/:userId', imageSingleUpload, RemoveLike);


userRoutes.delete("/api/v1/delete-user/:userId", deleteUser);
userRoutes.patch("/api/v1/update-user/:userId", imageSingleUpload, updateUser);
userRoutes.post('/api/v1/follow/:userId', imageSingleUpload, followUser);
userRoutes.post('/api/v1/unfollow/:userId', imageSingleUpload, unFollowUser);
userRoutes.put('/api/v1/change-my-profile-status/:userId', imageSingleUpload, changeProfileStatus);
userRoutes.put('/api/v1/change-user-role/:userId', imageSingleUpload, changeUserRole);
userRoutes.put('/api/v1/ban-active-user/:userId', imageSingleUpload, banActiveUserFunc);



module.exports = userRoutes;
