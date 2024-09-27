const express = require('express');
const multer = require('multer');
// const {adminOnly} = require('../../middlewares')
const { approvedReviewController } = require('../../controllers');

const upload = multer();
const approvedReviewRoute = express.Router();

approvedReviewRoute.post('/add-approved-review', approvedReviewController.addApprovedReview);
approvedReviewRoute.put('/update-approved-review/:approvedReviewId', upload.any(), approvedReviewController.updateApprovedReview);
approvedReviewRoute.delete('/delete-approved-review/:approvedReviewId', approvedReviewController.deleteApprovedReview);
// categoryRoute.get('/get-all-tours', tourControllers.getAllTours);

module.exports = approvedReviewRoute;