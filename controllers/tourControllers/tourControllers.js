const { TourModel, PopularTourModel, BestTourModel, DiscountedTourModel, SubCategoryModel } = require('../../models');
const { asyncHandler } = require('../../utils/asynhandler');
const { ErrorHandler } = require('../../utils/errohandler');
const { uploadImageToDrive, deleteImage, updateImageOnDrive } = require('../../middlewares');
const { createSlug } = require('../../utils/createSlug');
const { uploadImageToS3, updateImageToS3, deleteObjectFromS3 } = require('../../middlewares/awsS3');


const getTour = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await TourModel.findOne({slug}).populate("reviews")

  if (!tour) {
    return next(new ErrorHandler('Tour Not Found', 404));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Request Successfull',
      data: tour,
    },
  );
});

const getAllTours = asyncHandler(async (req, res, next) => {
  const tours = await TourModel.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'tourId',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        reviewCount: { $size: '$reviews' },
      },
    },
    {
      $project: {
        reviews: 0,
      },
    },
  ]).exec();

  if (tours.length === 0) {
    return next(new ErrorHandler('No Tours Found', 404));
  }

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Request Successfull',

      data: tours,
    },
  );
});

const addTour = asyncHandler(async (req, res, next) => {
  const { files } = req;
  const {
    title, duration, description, fullDescription, strikePrice, discountAmount, priceAdult, priceChild, priceInfant, languages, tag,  subCategoryId,
  } = req.body;

  if (!title || !duration || !description  || !fullDescription || !priceAdult || !priceChild || !priceInfant || !tag  || !subCategoryId )  { 
    return next(new ErrorHandler('Please fill all required fields', 400));
  }

  const includes = req?.body?.includes && JSON?.parse(req?.body?.includes);
  const highlights = req?.body?.highlights && JSON?.parse(req?.body?.highlights);
  const importantInformation = req?.body?.importantInformation && JSON?.parse(req?.body?.importantInformation);
console.log("importantInformation ", importantInformation);

  const subCategory = await SubCategoryModel.findById(subCategoryId);
  if (!subCategory) {
    return next(new ErrorHandler('SubCategory Not Found', 400));
  }

  let childPriceAfterDiscount = 0 
  let adultPriceAfterDiscount = 0
if (discountAmount > 0) {
  childPriceAfterDiscount = priceChild - discountAmount,
  adultPriceAfterDiscount = priceAdult - discountAmount
}

let cardImageId;
  const tourImagesPromises = [];

  for (const file of files) {

    if (file.fieldname === 'cardImage') {
      cardImageId = uploadImageToS3(file);

    } else if (file.fieldname === 'tourImages') {
      tourImagesPromises.push(uploadImageToS3(file));
    }
  }

const [cardImageIdResolved, ...tourImagesIdsResolved] = await Promise.all([
    cardImageId || Promise.resolve(null),
    ...tourImagesPromises
  ]);
  
  const slugAuto = createSlug(title);
  const tours = await TourModel.create({
    title,
    slug: slugAuto,
    cardImage: cardImageIdResolved,
    tourImages: tourImagesIdsResolved,
    duration,
    description,
    fullDescription,
    strikePrice,
    priceAdult,
    priceChild,
    priceInfant,
    childPriceAfterDiscount,
    adultPriceAfterDiscount,
    discountAmount,
    languages,
    tag,
    highlights,
    includes,
    // heading,
    importantInformation,
    subCategoryId,
    
  });
  
  
  if (!tours) {
    return next(new ErrorHandler('Unable to add tours', 500));
  }
  const updateSubcategory = await SubCategoryModel.findByIdAndUpdate(
    subCategoryId,
    { $push: { tourId: tours._id } }, // Push the created tour's ID into the tourId array
    { new: true } // Return the updated document
  );

  if (!updateSubcategory) {
    return next(new ErrorHandler('Unable to add tour to subcategory', 500));
  }

  if (discountAmount > 0) {
    const discountedTour = await DiscountedTourModel.findOneAndUpdate(
      {}, // No filter, updates the first document or creates a new one
      { 
        $push: { tourId: tours._id }, 
        },
      { 
        new: true, 
        upsert: true 
      }
    );
    if (!discountedTour) {
      return next(new ErrorHandler('Unable to add tour to discounted tours', 500));
    }  
  }
  
  return res.status(200).json({
    status: 'Success',
    code: 200,
    message: 'Tour added successfully',
    data: tours,
  });
});


const updateTour = asyncHandler(async (req, res, next) => {
  const { tourId } = req.params;
  const { files } = req;
  const {
    title, duration, description, fullDescription, strikePrice,discountAmount, priceAdult, priceChild, priceInfant, languages, tag,  subCategoryId,
    highlightPoint, highlightId, includePoint, includePointId, includeType, importantInfoId,  importantInfoPoint, importantInfoHeading, tourImageId
  } = req.body;

  let tour = await TourModel.findById(tourId);
  if (!tour) {
    return next(new ErrorHandler('Tour Not Found', 404));
  }

  if (discountAmount > 0) {
    tour.childPriceAfterDiscount = tour.priceChild - discountAmount;
    tour.adultPriceAfterDiscount = tour.priceAdult - discountAmount;
    tour.discountAmount = discountAmount

    const discountedTour = await DiscountedTourModel.findOne({
      tourId: { $in: [tourId] }
    });
    if (!discountedTour) {
      const newDiscountedTour = await DiscountedTourModel.findOneAndUpdate(
        {}, 
        { $push: { tourId: tour._id },},
        { new: true, 
          upsert: true }
      );


      if (!newDiscountedTour) {
        return next(new ErrorHandler('Unable to add tour to discounted tours', 500));
      }
    } 
  } else if( discountAmount == 0){
    tour.discountAmount = discountAmount
    tour.childPriceAfterDiscount = 0;
    tour.adultPriceAfterDiscount = 0;
    const updatedDiscountedTour = await DiscountedTourModel.findOneAndUpdate(
      {}, // Since you have only one document
      { $pull: { tourId: tour._id } },
      { new: true }
    );
  
    if (!updatedDiscountedTour) {
      return next(new ErrorHandler('Unable to remove tour from discounted tours', 500));
    }
  }


  if (importantInfoId) {
    tour.importantInformation = tour.importantInformation.map(info => {
      // If the current object's id matches the importantInfoId, update it
      if (info._id == importantInfoId) {
        return {
          ...info,
          heading: importantInfoHeading || info.heading ,  // Update heading
          points: importantInfoPoint ||   info.points  // Update points
        };
      }
      return info; // Return the object unchanged if ids don't match
    });    
  }




  // Update non-image fields
  tour.duration = duration || tour.duration;
  tour.description = description || tour.description;
  tour.fullDescription = fullDescription || tour.fullDescription;
  tour.strikePrice = strikePrice || tour.strikePrice;
  tour.priceAdult = priceAdult || tour.priceAdult;
  tour.priceChild = priceChild || tour.priceChild;
  tour.priceInfant = priceInfant || tour.priceInfant;
  tour.languages = languages || tour.languages;
  tour.tag = tag || tour.tag;
  // tour.heading = heading || tour.heading;
  tour.subCategoryId = subCategoryId || tour.subCategoryId;
  
  
  
  if (title) {
    tour.title = title 
    const slugAuto = createSlug(title);
    tour.slug = slugAuto;
      }

  const highlight = tour.highlights.find(h => h._id.toString() === highlightId);
  const includes = tour.includes.find(h => h._id.toString() === includePointId);
  // const importantInfo = tour.importantInformation.find(h => h._id.toString() === importantInfoPointId);

  if (highlight) {
    highlight.points = highlightPoint || highlight.points;

  } 
  if (includes) {
    includes.point = includePoint || includes.point;
    includes.type = includeType || includes.type;
  } 
  //  if (importantInfo) {
  //   importantInfo.point = importantInfoPoint || importantInfo.point;
  // }


  if (files && files.length !== 0) {
    for (const file of files) {
      if (file.fieldname === 'cardImage') {
        await updateImageToS3( file, tour.cardImage,);
      } else if (file.fieldname === 'tourImage') {
        await updateImageToS3( file, tourImageId);
      }
    }
  }

  const updatedTour = await tour.save();

  if (!updatedTour) {
    return next(new ErrorHandler('Error while updating tour', 500));
  }

  return res.status(200).json({
    status: 'Success',
    code: 200,
    message: 'Tour updated successfully',
    data: updatedTour,
  });
});



const deleteTour = asyncHandler(async (req, res, next) => {
  const { tourId } = req.params;

  const tour = await TourModel.findById(tourId).exec();


  if (!tour) {
    return next(new ErrorHandler('Tour Doesn\'t Exist', 404));
  }

  const tourAllImages = [...tour.tourImages, tour.cardImage];

  try {
    await Promise.all(tourAllImages.map(imageId => {

      deleteObjectFromS3(imageId)

    }));
  } catch (error) {
    return next(new ErrorHandler('Error deleting images from drive', 500));
  }

  const models = [PopularTourModel, BestTourModel, DiscountedTourModel];
  await Promise.all(models.map(model => model.deleteOne({ tourId: tourId }).exec()));

  // Delete tour from main TourModel
  const deletedTour = await TourModel.findByIdAndDelete(tourId).exec();

  if (!deletedTour) {
    throw new ErrorHandler('Unable to delete tour', 404);
  }


  return res.status(200).json({
    status: 'Success',

    message: 'Tour Deleted Successfully',
  });
});

module.exports = {
  getAllTours,
  getTour,
  addTour,
  updateTour,
  deleteTour,
};