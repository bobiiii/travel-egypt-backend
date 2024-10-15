const express = require('express');
const { blogControllers } = require('../../controllers');

const blogRoute = express.Router();
console.log("a");


blogRoute.post('/add-blog', blogControllers.addBlogController);
// blogRoute.put('/update-besttour/:bestTourId', blogControllers.updateBestTour);
blogRoute.delete('/delete-blog/:blogId', blogControllers.deleteBlogController);

module.exports = blogRoute;
