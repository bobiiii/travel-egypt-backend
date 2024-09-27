const { TourModel, PopularTourModel, BestTourModel, DiscountedTourModel, SubCategoryModel } = require('../../models');
const { asyncHandler } = require('../../utils/asynhandler');
const { ErrorHandler } = require('../../utils/errohandler');
const { uploadImageToDrive, deleteImage, updateImageOnDrive } = require('../../middlewares');
const { createSlug } = require('../../utils/createSlug');


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
    title, duration, description, fullDescription, strikePrice, priceAdult, priceChild, languages, tag, heading, subCategoryId,
  } = req.body;


  const includes = req?.body?.includes && JSON?.parse(req?.body?.includes);
  const highlights = req?.body?.highlights && JSON?.parse(req?.body?.highlights);
  const importantInformation = req?.body?.importantInformation && JSON?.parse(req?.body?.importantInformation);



  const subCategory = await SubCategoryModel.findById(subCategoryId);
  if (!subCategory) {
    return next(new ErrorHandler('SubCategory Not Found', 400));
  }


  let cardImageId;
  const tourImagesPromises = [];


  for (const file of files) {

    if (file.fieldname === 'cardImage') {
      cardImageId = uploadImageToDrive(file);

    } else if (file.fieldname === 'tourImages') {
      tourImagesPromises.push(uploadImageToDrive(file));
    }
  }


  // const slugify = (name) => name ? name.toLowerCase().replace(/\s+/g, '-') : `tour-${Date.now()}`;
  const slugAuto = createSlug(title);


  const [cardImageIdResolved, ...tourImagesIdsResolved] = await Promise.all([
    cardImageId || Promise.resolve(null),
    ...tourImagesPromises
  ]);

  
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
    languages,
    tag,
    highlights,
    includes,
    heading,
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

  if (!tours) {
    return next(new ErrorHandler('Unable to add tour', 500));
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
    title, duration, description, fullDescription, strikePrice, priceAdult, priceChild, languages, tag, heading, subCategoryId,
    highlightPoint, highlightId, includePoint, includePointId, importantInfoPoint, importantInfoPointId, tourImageId
  } = req.body;

  let tour = await TourModel.findById(tourId);
  if (!tour) {
    return next(new ErrorHandler('Tour Not Found', 404));
  }



  // Update non-image fields
  tour.duration = duration || tour.duration;
  tour.description = description || tour.description;
  tour.fullDescription = fullDescription || tour.fullDescription;
  tour.strikePrice = strikePrice || tour.strikePrice;
  tour.priceAdult = priceAdult || tour.priceAdult;
  tour.priceChild = priceChild || tour.priceChild;
  tour.languages = languages || tour.languages;
  tour.tag = tag || tour.tag;
  tour.heading = heading || tour.heading;
  tour.subCategoryId = subCategoryId || tour.subCategoryId;
  
  
  
  if (title) {
    tour.title = title 
    const slugAuto = createSlug(title);
    tour.slug = slugAuto;
      }

  const highlight = tour.highlights.find(h => h._id.toString() === highlightId);
  const includes = tour.includes.find(h => h._id.toString() === includePointId);
  const importantInfo = tour.importantInformation.find(h => h._id.toString() === importantInfoPointId);

  if (highlight) {
    highlight.point = highlightPoint || highlight.point;

  } else if (includes) {
    includes.point = includePoint || includes.point;
  } else if (importantInfo) {
    importantInfo.point = importantInfoPoint || importantInfo.point;
  }


  if (files && files.length !== 0) {
    for (const file of files) {
      if (file.fieldname === 'cardImage') {
        await updateImageOnDrive(tour.cardImage, file);
      } else if (file.fieldname === 'tourImage') {
        await updateImageOnDrive(tourImageId, file);
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

      deleteImage(imageId)

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