const { PopularTourModel } = require("../../models");
const { asyncHandler } = require("../../utils/asynhandler");
const { ErrorHandler } = require("../../utils/errohandler");

const getAllPopularTours = asyncHandler(async (req, res, next) => {
  
  const popularTours = await PopularTourModel.find({}).aggregate([
    
    {
      $lookup: {
        from: 'tours', 
        localField: 'tourId',
        foreignField: '_id',
        as: 'tourId',
      },
    },
    {
      $unwind: '$tourId', 
    },
    {
      $lookup: {
        from: 'reviews', 
        localField: 'tourId.reviewsId',
        foreignField: '_id',
        as: 'tourId.reviewsId',
      },
    },
    {
      $group: { 
        _id: '$_id',
        tourId: { $push: '$tourId' },


      },
    },
    {
      $addFields: {
        'tourId.reviewCount': { $size: '$tourId.reviewsId' },
      },
    },
  ]);
  if (!popularTours) {
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
  const {popularTourId} = req.body

  if (!popularTourId) {
    return next(new ErrorHandler('Please send valid popularTourId', 500));
  }

  const popularTour = await PopularTourModel.findOneAndUpdate(
    {}, // No filter, updates the first document or creates a new one
    { 
      $push: { tourId: popularTourId }, 
      },
    { 
      new: true, 
      upsert: true 
    }
  );

  // const popularTour = await PopularTourModel.create(req.body);
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
const {popularTourId} = req.body
  const updatedPopularTours = await PopularTourModel.findOneAndUpdate(
    {}, // Since you have only one document
    { $pull: { tourId: popularTourId } },
    { new: true }
  );

  if (!updatedPopularTours) {
    return next(new ErrorHandler('Unable to remove tour from popular tours', 500));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Tour removed Successfully',
      // data: popularTours,
    },
  );
})

const deletePopularTour = asyncHandler(async (req, res, next) => {
  const {popularTourId} = req.params
  const updatedPopularTours = await PopularTourModel.findOneAndUpdate(
    {}, // Since you have only one document
    { $pull: { tourId: popularTourId } },
    { new: true }
  );

  if (!updatedPopularTours) {
    return next(new ErrorHandler('Unable to remove tour from popular tours', 500));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Tour removed Successfully',
      // data: popularTours,
    },
  );
});

module.exports = {
  getAllPopularTours, addPopularTour, updatePopularTour,  deletePopularTour,
  };
  