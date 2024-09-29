const { TourModel } = require("../../models");
const { asyncHandler } = require("../../utils/asynhandler");
const { ErrorHandler } = require("../../utils/errohandler");

const getAllRelatedTours = asyncHandler(async (req, res, next) => {
      const { tag } = req.query;
  
      if (!tag) {
        return next(new ErrorHandler('tag is required', 500));
      }
  
      const relatedTours = await TourModel.find({ tag: tag }); // Assuming you're using Mongoose
  
      if (!relatedTours.length) {
        return next(new ErrorHandler('No related tours available', 500));
      }

      return res.status(200).json({
        status: 'Success',
        code: 200,
        message: 'Request Successfull',
        data: relatedTours,
      });
    
  }); 

module.exports = {
    getAllRelatedTours
}