const { uploadImageToDrive, deleteImage, updateImageOnDrive } = require('../../middlewares');
const { SubCategoryModel, CategoryModel } = require('../../models');
const { asyncHandler } = require('../../utils/asynhandler');
const { createSlug } = require('../../utils/createSlug');
const { ErrorHandler } = require('../../utils/errohandler');

// dummy controller , dont play with it
const getSubCategoryWithTours = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.params;
  // const category = await SubCategoryModel.findOne({_id: subCategoryId }).exec();

  // if (!category) {
  //     throw new Error('Category not found');
  //   }

  // Fetch all tours related to the category
  const tours = await SubCategoryModel.find({ categories: subCategoryId }).exec();

  return res.status(200).json(
    {
      status: 'Success',
      message: 'Request Successfull',

      // category: category,
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
  const SubCategory = await SubCategoryModel.findOne({slug}).populate('tourId').exec();

  if (!SubCategory) {
    return next(new ErrorHandler('Subcategory Not Found', 404));
  }

  return res.status(200).json({
    status: 'Success',
    code: 200,
    message: 'Request Successfull',
    data: SubCategory,
  });
});

const addSubCategory = asyncHandler(async (req, res, next) => {
  const { files } = req;
  const {
    categoryId, tourId, subCategoryName,
  } = req.body;
  
  let category = await CategoryModel.findById(categoryId);
  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  } 
  
  const subCategoryImage = files.find((item) => item.fieldname === 'subCategoryImage');
  if (!categoryId || !subCategoryName || !subCategoryImage) {
    return next(new ErrorHandler('please fill all fields', 400));
  }

  // const slugify = (subCategoryName) => subCategoryName.toLowerCase().replace(/\s+/g, '-');
  const sulgAuto = createSlug(subCategoryName);

  const subCategoryImageId = await uploadImageToDrive(subCategoryImage);
  const subCategory = await SubCategoryModel.create({
    categoryId,
    tourId,
    slug: sulgAuto,
    subCategoryName,
    subCategoryImage: subCategoryImageId,
  });

  if (!subCategory) {
    return next(new ErrorHandler('Unable to add subcategory', 500));
  }


  category.subCategoryId = [...category.subCategoryId, subCategory._id];
  await category.save();

  return res.status(200).json({
    status: 'Success',
    code: 200,
    message: 'Add Category Successfully',
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
  const { subCategoryName } = req.body;
  const {files} = req;
  
  
  let subCategory = await SubCategoryModel.findById(subcategoryId);
  if(!subCategory){
    return next(new ErrorHandler('subCategory Not Found', 404))
  }
  
  if(files && files.length !== 0){
    const updateImage = files.find((item)=>item.fieldname === 'subCategoryImage')

    if(updateImage){
      let updateImageId = await updateImageOnDrive(subCategory.subCategoryImage, updateImage)
      subCategory.subCategoryImage = updateImageId;
    }
  }
  

  if (subCategoryName && subCategoryName !== subCategory.subCategoryName) {
    // const slugify = (subCategoryName) => subCategoryName.toLowerCase().replace(/\s+/g, '-')
    const slugAuto = createSlug(subCategoryName);
    subCategory.slug = slugAuto;
    subCategory.subCategoryName = subCategoryName 
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

  if (!subCategory) {
    return next(new ErrorHandler('Subcategory Doesn\'t Exist', 404));
  }

  await deleteImage(subCategory.subCategoryImage);

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
