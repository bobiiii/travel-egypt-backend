const { uploadImageToDrive, deleteImage, updateImageOnDrive } = require('../../middlewares');
const { uploadImageToS3 } = require('../../middlewares/awsS3');
const { ReviewModel, TourModel } = require('../../models');
const { asyncHandler } = require('../../utils/asynhandler');
const { ErrorHandler } = require('../../utils/errohandler');

const getReviews = asyncHandler(async (req, res, next) => {
  const reviews = await ReviewModel.find({});

  if (reviews.length === 0) {
    return next(new ErrorHandler('no reviews found', 404));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Request Successfull',
      data: reviews,
    },
  );
});

  const getApprovedReviews = asyncHandler(async (req, res, next) => {
    const reviews = await ReviewModel.find({isApproved: 'approved'});
  
    if (reviews.length === 0) {
      return next(new ErrorHandler('no approved reviews found', 404));
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
  const {files} = req;
  const {
    tourId, name, rating, reviewText, 
  } = req.body;

  const reviewImage = files.find((item) => item.fieldname === 'images');

  if (!tourId || !name  || !rating || !reviewText || !reviewImage ) {
    return next(new ErrorHandler('please fill all fields', 500));
  }

  const tour = await TourModel.findById(tourId);
  if (!tour) {
    return next(new ErrorHandler('Tour not found', 404));
  } 


  // let imageId;
  let reviewImages = [];

  for (const file of files) {

    if (file.fieldname === 'images') {
      reviewImages.push(uploadImageToS3(file));
      // imageId =
    } 
  }

  // const reviewImageId = await uploadImageToDrive(reviewImage);
  const review = await ReviewModel.create({
    tourId, name, rating, imageId:reviewImages , reviewText, 
  });

  if (!review) {
    return next(new ErrorHandler('Unable To Add review', 500));
  }

  // const updateTourReview = await TourModel.findByIdAndUpdate(
  //   tourId,
  //   { $push: { tourId: review._id } }, // Push the created tour's ID into the tourId array
  //   { new: true } // Return the updated document
  // );

  // tour.reviewsId = [...tour.reviewsId, review._id];
  // await tour.save();

  return res.status(200).json({
    status: 'Success',
    message: 'Add review Successfully',
    data: review,
  });
});

const updateReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  // const { files } = req;
  const { response, tourId } = req.body;


  if (!response || !tourId || !reviewId) {
    return next(new ErrorHandler('Please Fill all required fields', 500));
  }

  let review = await ReviewModel.findById(reviewId);

  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

review.response = response;
  await review.save();

  const updateTourReview = await TourModel.findByIdAndUpdate(
    tourId,
    { $push: { reviewsId: review._id } }, 
    { new: true } // Return the updated document
  );


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
  getReviews, addReview, updateReview, deleteReview, getApprovedReviews,
};
