const express = require('express');
const { blogControllers } = require('../../controllers');
const multer = require('multer');

const blogRoute = express.Router();
const upload = multer();

blogRoute.post('/add-blog',upload.any(), blogControllers.addBlogController);
// blogRoute.put('/update-besttour/:bestTourId', blogControllers.updateBestTour);
blogRoute.delete('/delete-blog/:blogId', blogControllers.deleteBlogController);

module.exports = blogRoute;
