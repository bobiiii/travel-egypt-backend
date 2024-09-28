const mongoose = require('mongoose');
const { asyncHandler } = require('../../utils/asynhandler');
const { BestTourModel, TourModel } = require('../../models');
const { ErrorHandler } = require('../../utils/errohandler');

const addBestToursController = asyncHandler(async (req, res, next) => {
  const { bestTourId } = req.body;

  if (!bestTourId) {
    return next(new ErrorHandler('Please send valid popularTourId', 500));
  }
  const bestTour = await BestTourModel.findOneAndUpdate(
    {}, // No filter, updates the first document or creates a new one
    { 
      $push: { tourId: bestTourId }, 
      },
    { 
      new: true, 
      upsert: true 
    }
  );


  if (!bestTour) {
    return next(new ErrorHandler('Unable to add BestTour', 500));
  }

  return res.status(200).json({
    status: 'Success',
    message: 'Add BestTour Successfully',
    data: bestTour,
  });
});

const getAllBestTours = asyncHandler(async (req, res, next) => {
  const bestTours = await BestTourModel.find({}).populate("tourId")

  if (!bestTours) {
    return next(new ErrorHandler('No bestTours Found'), 404);
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Request Successfull',

      data: bestTours,
    },
  );
});

const getBestTour = asyncHandler(async (req, res, next) => {
  const { bestTourId } = req.params;

  const objId = await new mongoose.Types.ObjectId(bestTourId);
  const bestTour = await BestTourModel.aggregate([
    { $match: { _id: objId } },
    {
      $lookup: {
        from: 'tours',
        localField: 'tourId',
        foreignField: '_id',
        as: 'tourDetails',
      },
    },
    {
      $project: {
        'tourDetails._id': 0,
      },
    },
  ]);

  if (bestTour.length === 0) {
    return next(new ErrorHandler('BestTour Not Found'), 404);
  }

  return res.status(200).json({
    status: 'Success',
    message: 'Request Successfull',
    data: bestTour,
  });
});

const deleteBestTour = asyncHandler(async (req, res, next) => {
  const {bestTourId} = req.params
  const bestTour = await BestTourModel.findOneAndUpdate(
    {}, // Since you have only one document
    { $pull: { tourId: bestTourId } },
    { new: true }
  );

  if (!bestTour) {
    return next(new ErrorHandler('Unable to remove tour from BestSelling  tours', 500));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Tour removed Successfully',
      // data: popularTours,
    },
  )
});

const updateBestTour = asyncHandler(async (req, res) => {
  
  const {bestTourId} = req.body
  const bestTour = await BestTourModel.findOneAndUpdate(
    {}, // Since you have only one document
    { $pull: { tourId: bestTourId } },
    { new: true }
  );

  if (!bestTour) {
    return next(new ErrorHandler('Unable to remove tour from popular tours', 500));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Tour removed Successfully',
      // data: popularTours,
    },
  )
});

module.exports = {
  addBestToursController,
  getAllBestTours,
  getBestTour,
  deleteBestTour,
  updateBestTour,
};
