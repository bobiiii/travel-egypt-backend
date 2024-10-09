const express = require('express');
const multer = require('multer');
const { userControllers } = require('../../controllers');

const userRoute = express.Router();

userRoute.get('/get-users',  userControllers.getAllUsers);
userRoute.post('/add-user',  userControllers.addUser);
userRoute.put('/update-user/:userId',  userControllers.updateUser);
userRoute.delete('/delete-user/:userId',  userControllers.deleteUser);
// userRoute.put('/update-tour/:tourId', upload.any(), tourControllers.updateTour);
// userRoute.delete('/delete-tour/:tourId', tourControllers.deleteTour);
// tourRoute.get('/get-all-tours', tourControllers.getAllTours);

module.exports = userRoute;
