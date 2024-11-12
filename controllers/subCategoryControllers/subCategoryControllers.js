const { updateImageToS3, deleteObjectFromS3 } = require('../../middlewares/awsS3');
const { uploadImage, deleteImage, updateImageLocal } = require('../../middlewares/imageHandlers');
const { SubCategoryModel, CategoryModel, BestTourModel, DiscountedTourModel, PopularTourModel, TourModel } = require('../../models');
const { asyncHandler } = require('../../utils/asynhandler');
const { createSlug } = require('../../utils/createSlug');
const { ErrorHandler } = require('../../utils/errohandler');

const getSubCategoryWithTours = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.params;
  
  const tours = await SubCategoryModel.find({ categories: subCategoryId }).exec();

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Request Successfull',
      data: tours,

    },
  );
});

const getAllSubCategories = asyncHandler(async (req, res, next) => {
  const subCategories = await SubCategoryModel.find({})

  if (subCategories.length === 0) {
    return next(new ErrorHandler('no subcategories found', 404));
  }

  return res.status(200).json(
    {
      status: 'Success',
      code: 200,
      message: 'Request Successfull',
      data: subCategories,
    },
  );
});

const getSubCategory = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  // Debugging check to ensure document exists
  const exist = await SubCategoryModel.findOne({ slug });

  const SubCategory = await SubCategoryModel.aggregate([
    { $match: { slug } },
    {
      $lookup: {
        from: 'tours',
        localField: 'tourId',
        foreignField: '_id',
        as: 'tourId',
      },
    },
    {
      $unwind: {
        path: '$tourId',
        preserveNullAndEmptyArrays: true,
      },
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
        categoryId: { $first: '$categoryId' },
        subCategoryName: { $first: '$subCategoryName' },
        subCategoryImage: { $first: '$subCategoryImage' },
        subCategoryTitle: { $first: '$subCategoryTitle' },
        subCategoryText: { $first: '$subCategoryText' },
        subCategoryHeroImage: { $first: '$subCategoryHeroImage' },
        subCategoryMobHeroImage: { $first: '$subCategoryMobHeroImage' },
        tourId: {
          $push: {
            $mergeObjects: [
              '$tourId',
              {
                reviewsId: {
                  $filter: {
                    input: '$tourId.reviewsId',
                    as: 'review',
                    cond: { $eq: ['$$review.status', 'Approved'] },
                  },
                },
                reviewCount: {
                  $size: {
                    $filter: {
                      input: '$tourId.reviewsId',
                      as: 'review',
                      cond: { $eq: ['$$review.status', 'Approved'] },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  ]);
  


  if (!SubCategory || SubCategory.length === 0) {
    return next(new ErrorHandler('Subcategory Not Found', 404));
  }

  return res.status(200).json({
    status: 'Success',
    code: 200,
    message: 'Request Successful',
    data: SubCategory,
  });
});


const addSubCategory = asyncHandler(async (req, res, next) => {
  const { files } = req;
  const {
    categoryId,  subCategoryName, subCategoryTitle,
    subCategoryText
  } = req.body;
  

  let category = await CategoryModel.findById(categoryId);
  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  } 
  
  const subCategoryImage = files.find((item) => item.fieldname === 'subCategoryImage');
  const subCategoryHeroImage = files.find((item) => item.fieldname === 'subCategoryHeroImage');
  const subCategoryMobHeroImage = files.find((item) => item.fieldname === 'subCategoryMobHeroImage');
  
  
  
  if (!categoryId || !subCategoryName || !subCategoryImage || !subCategoryTitle ||
    !subCategoryText) {
    return next(new ErrorHandler('please fill all fields', 400));
  }

  // const slugify = (subCategoryName) => subCategoryName.toLowerCase().replace(/\s+/g, '-');
  const sulgAuto = createSlug(subCategoryName);

  const subCategoryImageId = await uploadImage(subCategoryImage, "subCategory");
  const subCategoryHeroImageId = await uploadImage(subCategoryHeroImage, "subCategory");
  const subCategoryMobHeroImageId = await uploadImage(subCategoryMobHeroImage, "subCategory");


  const subCategory = await SubCategoryModel.create({
    categoryId,
    
    slug: sulgAuto,
    subCategoryName,
    subCategoryTitle,
    subCategoryText,
    subCategoryImage: subCategoryImageId,
    subCategoryHeroImage: subCategoryHeroImageId,
    subCategoryMobHeroImage: subCategoryMobHeroImageId
  });

  if (!subCategory) {
    return next(new ErrorHandler('Unable to add subcategory', 500));
  }


  category.subCategoryId = [...category.subCategoryId, subCategory._id];
  await category.save();

  return res.status(200).json({
    status: 'Success',
    code: 200,
    message: 'Subcategory added successfully',
    data: subCategory,
  });
});

// const updateSubCategory = asyncHandler(async (req, res) => {
//   const { subcategoryId } = req.params;
//   const { subCategoryName, tourId } = req.body;
//   const {files} = req;

//   let subCategory = await SubCategoryModel.findById(subcategoryId);
//   if(!subCategory){
//     return next(new ErrorHandler('subCategory Not Found', 404))
//   }

//   if(files && files.length !== 0){
//     const updateImage = files.find((item)=>item.fieldname === 'subCategoryImage')

//     if(updateImage){
//       let updateImageId = await updateImageOnDrive(updateImage)
//       subCategory.subCategoryImage = updateImageId;
//     }
//   }

//   if (subCategoryName && subCategoryName !== subCategory.subCategoryName) {
//     const slugify = (subCategoryName) => subCategoryName.toLowerCase().replace(/\s+/g, '-')
//     const slugAuto = slugify(subCategoryName);
//     subCategory.slug = slugAuto;
//   }

//   if (tourId) {
//     subCategory.tourId = [...new Set([...subCategory.tourId, ...tourId])];
//   }

//   const { subCategoryId: _, ...rest } = req.body;
//   Object.assign(category, rest);
//   await subCategory.save();

//   return res.status(200).json({
//     status: 'Success',
//     code: 200,
//     message: 'Update Subcategory successfully',
//     data: subCategory,
//   });
// });


const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { subcategoryId } = req.params;
  const { subCategoryName, subCategoryTitle, subCategoryText } = req.body;
  const {files} = req;
  
  
  let subCategory = await SubCategoryModel.findById(subcategoryId);
  if(!subCategory){
    return next(new ErrorHandler('subCategory Not Found', 404))
  }
  
  if(files && files.length !== 0){
    const updateImage = files.find((item)=>item.fieldname === 'subCategoryImage')
    const updateHeroImage = files.find((item)=>item.fieldname === 'subCategoryHeroImage') 
    const updateMobHeroImage = files.find((item)=>item.fieldname === 'subCategoryMobHeroImage')

    if(updateImage){
      let updateImageId = await updateImageLocal(updateImage, subCategory.subCategoryImage, "subCategory" )
      subCategory.subCategoryImage = updateImageId;
    }
    if(updateHeroImage){
      let updateHeroImageId = await updateImageLocal(updateHeroImage, subCategory.subCategoryHeroImage, "subCategory")
      subCategory.subCategoryHeroImage = updateHeroImageId;
    } 
       if(updateMobHeroImage){
      let updateMobHeroImageId = await updateImageLocal(updateMobHeroImage, subCategory.subCategoryMobHeroImage, "subCategory")
      subCategory.subCategoryMobHeroImage = updateMobHeroImageId;
    }
  }
  

  if (subCategoryName && subCategoryName !== subCategory.subCategoryName) {
    const slugAuto = createSlug(subCategoryName);
    subCategory.slug = slugAuto;
    subCategory.subCategoryName = subCategoryName 
  }

  if (subCategoryTitle) {
    subCategory.subCategoryTitle = subCategoryTitle 
  }
  if (subCategoryText) {
    subCategory.subCategoryText = subCategoryText 
  }
  const  updatedata = await subCategory.save();
  

  if (!updatedata) {
  return next(new ErrorHandler('error while updating subCategory', 404))
}
  return res.status(200).json({
    status: 'Success',
    code: 200,
    message: 'Update Subcategory successfully',
    data: subCategory,
  });
});

const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { subcategoryId } = req.params;

  const subCategory = await SubCategoryModel.findByIdAndDelete(subcategoryId).exec();
  
  if (subCategory && subCategory.tourId && subCategory.tourId.length > 0) {
    const tourIds = subCategory.tourId;
  
    const models = [ TourModel, PopularTourModel, BestTourModel, DiscountedTourModel, SubCategoryModel];
    
    await Promise.all(
      models.map(model => 
        model.deleteMany({ tourId: { $in: tourIds } }).exec()
      )
    );
  }

  if (!subCategory) {
    return next(new ErrorHandler('Subcategory Doesn\'t Exist', 404));
  }

  await deleteImage(subCategory.subCategoryImage, "subCategory");

  await CategoryModel.findByIdAndUpdate(subCategory.categoryId, {
    $pull: { subcategoryId: subCategory._id },
  });

  return res.status(200).json({
    status: 'Success',
    code: 200,
    message: 'SubCategory Deleted Successfully',
    data: subCategory,
  });
});

module.exports = {
  getAllSubCategories,
  getSubCategory,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,

};
