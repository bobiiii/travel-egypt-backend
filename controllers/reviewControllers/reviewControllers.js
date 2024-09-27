const { uploadImageToDrive, deleteImage, updateImageOnDrive } = require('../../middlewares');
const { ReviewModel } = require('../../models');
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
    tourId, name, rating, comment, response, readMoreUrl
  } = req.body;

  const reviewImage = files.find((item) => item.fieldname === 'imageURL');

  // if (!tourId || !name || !imageURL || !rating || !comment || !response || !readMoreUrl) {
  //   return next(new ErrorHandler('please fill all fields', 400));
  // }
  const reviewImageId = await uploadImageToDrive(reviewImage);
  const review = await ReviewModel.create({
    tourId, name, rating, imageURL:reviewImageId , comment, response, readMoreUrl
  });

  if (!review) {
    return next(new ErrorHandler('Unable To Add review', 500));
  }

  let tour = await CategoryModel.findById(tourId);
  if (!tour) {
    return next(new ErrorHandler('Category not found', 404));
  } 

  tour.reviewsId = [...tour.reviewsId, review._id];
  await tour.save();

  return res.status(200).json({
    status: 'Success',
    message: 'Add review Successfully',
    data: review,
  });
});

const updateReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  const { files } = req;

  let review = await ReviewModel.findById(reviewId);

  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

  if (files && files.length > 0) {
    const newImage = files.find((item) => item.fieldname === 'imageURL');
    
    if (newImage) {

      const newImageId = await updateImageOnDrive(newImage);

      review.imageURL = newImageId;
    }
  }

  Object.assign(review, req.body);

  await review.save();

  return res.status(200).json({
    status: 'Success',
    message: 'Review updated successfully',
    data: review,
  });
});


const deleteReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await ReviewModel.findByIdAndDelete(reviewId).exec();

  if (!review) {
    return next(new ErrorHandler('review doesn\'t exist', 404));
  }
  if (review.imageURL) {
    await deleteImage(review.imageURL);
  }

  await TourModel.findByIdAndUpdate(review.tourId, {
    $pull: { reviewsId: review._id },
  });

  return res.status(200).json({
    status: 'Success',
    message: 'review Deleted Successfully',
    data: review,
  });
});

module.exports = {
  getReviews, addReview, updateReview, deleteReview, getApprovedReviews,
};
