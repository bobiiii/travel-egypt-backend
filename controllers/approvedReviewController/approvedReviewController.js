const {ApprovedReviewModel, ReviewModel} = require('../../models');
const {asyncHandler} = require('../../utils/asynhandler');
const {ErrorHandler} = require('../../utils/errohandler');



const addApprovedReview = asyncHandler( async (req, res, next)=>{
    const {reviewId} = req.body;

    
  if (reviewId === '') {
    return next(new ErrorHandler('Please fill the fields', 400));
  }
  const Review = await ReviewModel.findById(reviewId);

  if (!Review) {
    return next(new ErrorHandler('Review Doesn\'t Exist', 404));
  }

  const approvedReview = await ApprovedReviewModel.create(req.body);

  if (!approvedReview) {
    return next(new ErrorHandler('Unable to add approvedReview', 500));
  }

  return res.status(200).json({
    status: 'Success',
    message: 'Add approvedReview Successfully',
    data: approvedReview,
  });
});

const getAllApprovedReview = asyncHandler(async (req, res)=>{
 
    const approvedReviews = ApprovedReviewModel.aggregate([
        {
            $lookup: {
                from: 'reviews', 
                localField: 'reviewId',
                foreignField: '_id', 
                as: 'reviewDetails'
              }
            },
            { $unwind: '$reviewDetails' },
            {
              $replaceRoot: { newRoot: '$reviewDetails' }
            }
    ])

    if (approvedReviews.length === 0) {
        return next(new ErrorHandler('No approvedReviews Found'), 404);
      }

    return res.status(200).json({
        status: 'Success',
        code: 200,
        data: approvedReviews,
      });
})

const deleteApprovedReview = asyncHandler(async (req, res, next) => {
    const { approvedReviewId } = req.params;
    const approvedReview = await ApprovedReviewModel.findByIdAndDelete(approvedReviewId);
  
    if (!approvedReview) {
      return next(new ErrorHandler('ApprovedReview Doesn\'t Exist', 404));
    }
    return res.status(200).json({
      status: 'Success',
      message: 'ApprovedReview Deleted Successfully',
      data: approvedReview,
    });
  });


  const updateApprovedReview = asyncHandler(async (req, res) => {
    const { approvedReviewId } = req.params;
    const approvedReview = await ApprovedReviewModel.findByIdAndUpdate(approvedReviewId, req.body, { new: true });
  
    return res.status(200).json({
      status: 'Success',
      message: 'Update approvedReview Successfully',
      data: approvedReview,
    });
  });


  module.exports = {
    addApprovedReview, getAllApprovedReview, deleteApprovedReview, updateApprovedReview,
  }



