const mongoose = require('mongoose');
const { asyncHandler } = require('../../utils/asynhandler');
const { DiscountedTourModel, TourModel } = require('../../models');
const { ErrorHandler } = require('../../utils/errohandler');

const addDiscountedTourController = asyncHandler(async (req, res, next) => {
  const { tourId } = req.body;
  if (tourId === '') {
    return next(new ErrorHandler('please fill the fields', 400));
  }

  const tour = await TourModel.findById(tourId);
  if (!tour) {
    return next(new ErrorHandler('Tour Doesn\'t Exist', 404));
  }

  const discountedTour = await DiscountedTourModel.create(req.body);
  if (!discountedTour) {
    return next(new ErrorHandler('Unable to add discountedtour', 500));
  }

  return res.status(200).json({
    status: 'Success',
    message: 'Discounted Tour add SuccessFully',
    data: discountedTour,
  });
});

const getAllDiscountTours = asyncHandler(async (req, res, next) => {

  const discountedTours = await DiscountedTourModel.aggregate([
    
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


  if (discountedTours.length === 0) {
    return next(new ErrorHandler('No Discounted Tours Found', 404));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Request Successfull',
      data: discountedTours,
    },
  );
});

const getDiscountedTour = asyncHandler(async (req, res, next) => {
  const { discountedTourId } = req.params;

  const objId = await new mongoose.Types.ObjectId(discountedTourId);
  const discountedTour = await DiscountedTourModel.aggregate([
    { $match: { _id: objId } },
    {
      $lookup: {
        from: 'tours',
        localField: 'tourId',
        foreignField: '_id',
        as: 'tourDetails',
      },
    },
  ]);

  if (discountedTour.length === 0) {
    return next(new ErrorHandler('DiscountedTour Not Found', 404));
  }

  return res.status(200).json({
    status: 'Success',
    message: 'Request Successfull',
    data: discountedTour,
  });
});

const deleteDiscountedTour = asyncHandler(async (req, res, next) => {
  const { discountedTourId } = req.params;

  const discountedTour = await DiscountedTourModel.findByIdAndDelete(discountedTourId);
  if (!discountedTour) {
    return next(new ErrorHandler('Discountedtour doesn\'t exist', 404));
  }

  return res.status(200).json({
    status: 'Success',
    message: 'discountedTour Deleted Successfully',
    data: discountedTour,
  });
});

const updateDiscountedTour = asyncHandler(async (req, res) => {
  const { discountedTourId } = req.params;
  const discountedTour = await DiscountedTourModel.findByIdAndUpdate(discountedTourId, req.body, { new: true });

  return res.status(200).json({
    status: 'Success',
    message: 'Update Discounted tour Successfully',
    data: discountedTour,
  });
});

module.exports = {
  addDiscountedTourController,
  getAllDiscountTours,
  getDiscountedTour,
  deleteDiscountedTour,
  updateDiscountedTour,
};
