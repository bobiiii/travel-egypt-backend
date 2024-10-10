const { uploadImageToDrive, deleteImage, updateImageOnDrive } = require('../../middlewares');
const { uploadImageToS3 } = require('../../middlewares/awsS3');
const { ReviewModel, TourModel } = require('../../models');
const { asyncHandler } = require('../../utils/asynhandler');
const { ErrorHandler } = require('../../utils/errohandler');

const getReviews = asyncHandler(async (req, res, next) => {
const {tourId} = req.params
  
if (!tourId) {
  return next(new ErrorHandler('Please provide tourId', 400));
 
}
const reviews = await ReviewModel.find({ status: "Approved", tourId });


  if (reviews.length === 0) {
    return next(new ErrorHandler('No approved reviews found', 404));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Request Successfull',
      data: reviews,
    },
  );
});

  const getReviewsByStatus = asyncHandler(async (req, res, next) => {
    const {status} = req.query;

    if (!status) {
      return next(new ErrorHandler('Please filter by status', 404));
    }

    
    const reviews = await ReviewModel.find({status});
  
    if (reviews.length === 0) {
      return next(new ErrorHandler(`No ${status} reviews found`, 404));
    }
  
    return res.status(200).json(
      {
        status: 'Success',
        message: 'Request Successfull',
        data: reviews,
      },
    );
  });

const addReview = asyncHandler(async (req, res, next) => {
  // const {files} = req;
  const {
    tourId, tourName, firstName ,lastName ,phone  ,email, rating, reviewText, 
  } = req.body;

  // const reviewImage = files.find((item) => item.fieldname === 'images');

  if (!tourId || !tourName  || !firstName || !lastName ||!phone || !email  || !rating || !reviewText ) {
    return next(new ErrorHandler('please fill all fields', 500));
  }

  const tour = await TourModel.findById(tourId);
  if (!tour) {
    return next(new ErrorHandler('Tour not found', 404));
  } 

  const review = await ReviewModel.create({
    tourId, tourName, firstName ,lastName ,phone ,email, rating , reviewText, 
  });

  if (!review) {
    return next(new ErrorHandler('Unable To Add review', 500));
  }
  tour.reviewsId = [...tour.reviewsId, review._id];
  await tour.save();

  return res.status(200).json({
    status: 'Success',
    message: 'Thank you For your valuable Feedback!',
    data: review,
  });
});

const updateReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  const {status} = req.body
  // const { files } = req;
  // const {  tourId } = req.body;


  if (!reviewId || !status) {
    return next(new ErrorHandler('Please review Id and Status', 500));
  }

  let review = await ReviewModel.findById(reviewId);

  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

review.status = status;
  await review.save();


  let updateTourReview
if (status == "Pending" || status == "Rejected" ) {
   updateTourReview = await TourModel.findByIdAndUpdate(
    review.tourId,
    { $pull: { reviewsId: review._id } }, 
    { new: true } // Return the updated document
  );  
}else if (status == "Approved") {
  updateTourReview = await TourModel.findByIdAndUpdate(
    review.tourId,
    { $push: { reviewsId: review._id } }, 
    { new: true } // Return the updated document
  );
}


  

  if (!updateTourReview) {
    return next(new ErrorHandler('Unable to update review in tour', 500));
  }


  return res.status(200).json({
    status: 'Success',
    message: 'Review updated successfully',
    data: updateTourReview,
  });
});


const deleteReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await ReviewModel.findByIdAndDelete(reviewId).exec();

  if (!review) {
    return next(new ErrorHandler('review doesn\'t exist', 404));
  }
  

  const removedReview = await TourModel.findByIdAndUpdate(review.tourId, {
    $pull: { reviewsId: review._id },
  });

  if (!removedReview) {
    return next(new ErrorHandler('Unable to remove review from Tour', 404));
  }

  return res.status(200).json({
    status: 'Success',
    message: 'Review Deleted Successfully',
    data: removedReview,
  });
});

module.exports = {
  getReviews, addReview, updateReview, deleteReview, getReviewsByStatus,
};
