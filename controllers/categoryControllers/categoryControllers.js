const { CategoryModel, SubCategoryModel, TourModel } = require('../../models');
const { asyncHandler } = require('../../utils/asynhandler');
const { ErrorHandler } = require('../../utils/errohandler');
const { uploadImageToDrive, deleteImage, updateImageOnDrive } = require('../../middlewares');
const { responseHandler } = require('../../utils/response');
const { createSlug } = require('../../utils/createSlug');
const { uploadImageToS3, updateImageToS3, deleteObjectFromS3 } = require('../../middlewares/awsS3');

// req access

// dummy controller , dont play with it
const getCategory = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const category = await CategoryModel.findOne({ slug }).populate('subCategoryId').exec();

  if (!category) {
    return next(new ErrorHandler('catogery not found', 404));
  }

  // Fetch all tours related to the category
  // const tours = await TourModel.find({ categories: categoryId }).exec();

  return res.status(200).json(
    {
      status: 'Success',
      code: 200,
      message: 'Add Category SuccessFully',

      // category: category,
      data: category,

    },
  );
});

const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await CategoryModel.find({}).populate('subCategoryId').exec();

  if (categories.length === 0) {
    return next(new ErrorHandler('no categories found'), 404);
  }

  return res.status(200).json(
    {
      status: 'Success',
      code: 200,
      message: 'Request Successfull',
      data: categories,
    },
  );
});

const addCategory = asyncHandler(async (req, res, next) => {
  const { files } = req;
  let {
    categoryName,  bannerText,
    bannerSlogan
  } = req.body;

  const categoryImage = files.find((item) => item.fieldname === 'categoryImage');
  const categoryMobileImage = files.find((item) => item.fieldname === 'categoryMobImage');

  if (!categoryName || !categoryImage || !categoryMobileImage) {
    return next(new ErrorHandler('please fill all fields', 400));
  }

  // const slugify = (categoryName) => categoryName.toLowerCase().replace(/\s+/g, '-');
  const sulgAuto = createSlug(categoryName);
  // createSlug

  // const categoryImageId = await uploadImageToDrive(categoryImage);
  // const categoryMobileImageId = await uploadImageToDrive(categoryMobileImage);


  const categoryImageId = await uploadImageToS3(categoryImage);
const categoryMobileImageId = await uploadImageToS3(categoryMobileImage);


  const category = await CategoryModel.create({
    categoryName,
    categoryImage: categoryImageId,
    categoryMobImage: categoryMobileImageId,
    bannerText,
    bannerSlogan,
    slug: sulgAuto,
    
  });

  if (!category) {
    return next(new ErrorHandler('Unable to add category', 500));
  }

  return res.status(200).json({
    status: 'Success',
    code: 200,
    message: 'Request Successfull',
    data: category,
  });
});

const updateCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const { categoryName, subCategoryId, 
    bannerText,
    bannerSlogan, } = req.body;
  const { files } = req;

  // Step 1: Find category by ID
  let category = await CategoryModel.findById(categoryId);

  if (!category) {
    return next(new ErrorHandler('Category Not Found', 404));
  }

  if (bannerText) {
    category.bannerText = bannerText; 
  }
  if (bannerSlogan) {
    category.bannerSlogan = bannerSlogan; 
  }


  if (files && files.length !== 0) {
    const categoryImageId = category.categoryImage;
    const updateImage = files.find((item) => item.fieldname === "categoryImage");
    const categoryMobImage = files.find((item) => item.fieldname === "categoryMobImage");
    
    if (updateImage) {
      let updateImageId = await updateImageToS3( updateImage,category.categoryImage);
      category.categoryImage = updateImageId;
    }
    
    if (categoryMobImage){
      let categoryMobImageId = await updateImageToS3( categoryMobImage, category.categoryMobImage);
      category.categoryMobImage = categoryMobImageId;
    }
  }

  if (categoryName ) {
    // const slugify = (name) => name.toLowerCase().replace(/\s+/g, '-');
    category.slug = createSlug(categoryName); 
    category.categoryName = categoryName; 
  }


  




  if (subCategoryId && Array.isArray(subCategoryId)) {
    category.subCategoryId = [...new Set([...category.subCategoryId, ...subCategoryId])];
  }

  const { subCategoryId: _discarded, ...rest } = req.body;
  Object.assign(category, rest);

  await category.save();


   return responseHandler(res, "Category updated successfully", category )

});



const deleteCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;

  // Find the category
  const category = await CategoryModel.findById(categoryId);
  if (!category) {
    return next(new ErrorHandler("Category doesn't exist", 404));
  }

  // Delete category image if it exists
  if (category.categoryImage) {
    await deleteObjectFromS3(category.categoryImage);
    await deleteObjectFromS3(category.categoryMobImage);
  }

  // Use the subCategoryId array from the category to delete associated tours
  if (category.subCategoryId && category.subCategoryId.length > 0) {
    // Delete tours associated with these subcategories
    await TourModel.deleteMany({ subCategoryId: { $in: category.subCategoryId } });
  
    // Delete the subcategories themselves
    await SubCategoryModel.deleteMany({ _id: { $in: category.subCategoryId } });
  }
  

  // Delete the subcategories associated with the category


  // Delete the category itself
  const deleteCategory = await CategoryModel.findByIdAndDelete(categoryId);
  if (!deleteCategory) {
    return next(new ErrorHandler('Unable to delete category', 404));
  }

  // Return success response
  return res.status(200).json({
    status: 'Success',
    code: 200,
    message: 'Category, subcategories, and associated tours deleted successfully',
    data: category,
  });
});


module.exports = {
  getAllCategories, getCategory, addCategory, updateCategory, deleteCategory,
};
