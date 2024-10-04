const express = require('express');
const multer = require('multer');
const {adminOnly} = require('../../middlewares')
const { reviewControllers } = require('../../controllers');

const upload = multer();
const reviewRoute = express.Router();

reviewRoute.get('/get-reviews-status', reviewControllers.getReviewsByStatus);

reviewRoute.post('/add-review', upload.any(), reviewControllers.addReview);
reviewRoute.put('/update-review/:reviewId', upload.any(), reviewControllers.updateReview);
reviewRoute.delete('/delete-review/:reviewId', reviewControllers.deleteReview);
// categoryRoute.get('/get-all-tours', tourControllers.getAllTours);

module.exports = reviewRoute;