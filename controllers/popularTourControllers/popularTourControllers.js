const { PopularTourModel } = require("../../models");
const { asyncHandler } = require("../../utils/asynhandler");
const { ErrorHandler } = require("../../utils/errohandler");

const getAllPopularTours = asyncHandler(async (req, res, next) => {
  
  const popularTours = await PopularTourModel.find().populate('tourId');
  if (popularTours.length === 0) {
    return next(new ErrorHandler('No Popular Tours Found', 404));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Request Successfull',
      data: popularTours,
    },
  );
});

const addPopularTour = asyncHandler(async (req, res, next) => {
  
  const popularTour = await PopularTourModel.create(req.body);
  if (!popularTour) {
    return next(new ErrorHandler('Unable to add popular Tour', 500));
  }

  return res.status(200).json({
    status: 'Success',
    message: 'Popular Tour add SuccessFully',
    data: popularTour,
  });
});

const updatePopularTour  = asyncHandler(async(req,res,next)=>{
  return res.status(200).json({message:"Success"})
})

const deletePopularTour = asyncHandler(async (req, res, next) => {
  const { popularTourId } = req.params;

  const popularTour = await PopularTourModel.findByIdAndDelete(popularTourId);
  if (!popularTour) {
    return next(new ErrorHandler('Popular Tour doesn\'t exist', 404));
  }

  return res.status(200).json({
    status: 'Success',
    message: 'Popular Tour Deleted Successfully',
    
  });
});

module.exports = {
  getAllPopularTours, addPopularTour, updatePopularTour,  deletePopularTour,
  };
  