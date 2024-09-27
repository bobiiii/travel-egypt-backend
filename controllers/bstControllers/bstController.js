const mongoose = require('mongoose');
const { asyncHandler } = require('../../utils/asynhandler');
const { BestTourModel, TourModel } = require('../../models');
const { ErrorHandler } = require('../../utils/errohandler');

const addBestToursController = asyncHandler(async (req, res, next) => {
  const { tourId } = req.body;

  if (tourId === '') {
    return next(new ErrorHandler('Please fill the fields', 400));
  }
  const tour = await TourModel.findById(tourId);

  if (!tour) {
    return next(new ErrorHandler('Tour Doesn\'t Exist', 404));
  }

  const bestTour = await BestTourModel.create(req.body);

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
  // const bestTours = await BestTourModel.aggregate([
  //   {
  //     $lookup: {
  //       from: 'tours',
  //       localField: 'tourId',
  //       foreignField: '_id',
  //       as: 'tourDetails',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$tourDetails',
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $project: {
  //       'tourDetails._id': 0,
  //     },
  //   },
  // ]);

  if (bestTours.length === 0) {
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
  const { bestTourId } = req.params;
  const bestTour = await BestTourModel.findByIdAndDelete(bestTourId);

  if (!bestTour) {
    return next(new ErrorHandler('BestTour Doesn\'t Exist', 404));
  }
  return res.status(200).json({
    status: 'Success',
    message: 'BestTour Deleted Successfully',
    data: bestTour,
  });
});

const updateBestTour = asyncHandler(async (req, res) => {
  const { bestTourId } = req.params;
  const bestTour = await BestTourModel.findByIdAndUpdate(bestTourId, req.body, { new: true });

  return res.status(200).json({
    status: 'Success',
    message: 'Update BedtTour Successfully',
    data: bestTour,
  });
});

module.exports = {
  addBestToursController,
  getAllBestTours,
  getBestTour,
  deleteBestTour,
  updateBestTour,
};
