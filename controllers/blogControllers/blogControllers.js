const {BlogModel} = require('../../models');
const {asyncHandler} = require('../../utils/asynhandler');
const {ErrorHandler} = require('../../utils/errohandler');



const addBlog = asyncHandler(async (req, res, next) => {
    const { files } = req;
    let { title, para } = req.body;
    const cardImage = files.find((item) => item.fieldname === 'cardImage');
  
    // if (!title || !para) {
    //   return next(new ErrorHandler('please fill all fields', 400));
    // }
  
    const cardImageId = await uploadImageToDrive(cardImage);
    const blog = await BlogModel.create({
        title, 
        cardImage: cardImageId,
        para
    });
  
    if (!blog) {
      return next(new ErrorHandler('Unable to add blog', 500));
    }
  
    return res.status(200).json({
      status: 'Success',
      code: 200,
      message: 'Add Blog Successfully',
      data: blog,
    });
  });

  const getAllBlogs = asyncHandler(async (req, res, next) => {
    const blogs = await BlogModel.find({});
  
    if (blogs.length === 0) {
      return next(new ErrorHandler('no Blogs found'), 404);
    }
  
    return res.status(200).json(
      {
        status: 'Success',
        code: 200,
        message: 'Request Successfull',
        data: blogs,
      },
    );
  });

  const getBlog = asyncHandler(async (req, res, next) => {
    const { blogId } = req.params;
  
    const blog = await BlogModel.findById(blogId);
  
    if (!blog) {
      return next(new ErrorHandler('blog not found', 404));
    }

  
    return res.status(200).json(
      {
        status: 'Success',
        code: 200,
        message: 'Request SuccessFully',
        data: blog,
      },
    );
  });

  const updateBlog = asyncHandler(async (req, res, next) => {
    const { blogId } = req.params;
    const { title, para } = req.body;
    const { files } = req;
  
    let Blog = await BlogModel.findById(blogId);
  
    if (!Blog) {
      return next(new ErrorHandler('Blog Not Found', 404));
    }
  
  
    if (files && files.length !== 0) {
      const fileId = Blog.cardImage;
      const updateImage = files.find((item) => item.fieldname === "cardImage");
      if (updateImage) {
        let updateImageId = await updateImageOnDrive(fileId, updateImage);
        Blog.cardImage = updateImageId;
      }
    }
  
    Blog.title = title || Blog.title;
    Blog.para = para || Blog.para;
  
    await Blog.save();
  
    return res.status(200).json({
      status: 'Success',
      code: 200,
      message: 'Blog updated successfully',
      data: Blog,
    });
  });

  const deleteBlog = asyncHandler(async (req, res, next) => {
    const { blogId } = req.params;
  
    const deleteBlog =  await SubCategoryModel.findByIdAndDelete(blogId).exec();
  
    if (!deleteBlog) {
      return next(new ErrorHandler('Blog Not Found', 404));
    }
  
    await deleteImage(deleteBlog.cardImage);
    return res.status(200).json({
      status: 'Success',
      code: 200,
      message: 'Delete Blog SuccessFully',
    });
  });

  module.exports = {
    addBlog,
    getAllBlogs,
    getBlog,
    deleteBlog,
    updateBlog,
  }
