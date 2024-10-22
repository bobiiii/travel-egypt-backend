const { uploadImageToS3, deleteImageFromS3, updateImageToS3 } = require('../../middlewares/awsS3');
const {BlogModel} = require('../../models');
const {asyncHandler} = require('../../utils/asynhandler');
const { createSlug } = require('../../utils/createSlug');
const {ErrorHandler} = require('../../utils/errohandler');



const addBlogController = asyncHandler(async (req, res, next) => {
  const {files} = req
  
  const { title  , shortdesc  , category ,  date , content, } = req.body;
  const cardImage = files.find((item) => item.fieldname === 'cardImage');
  const mainImage = files.find((item) => item.fieldname === 'mainImage');
    
  // console.log(JSON.stringify(content, null, 2));
// console.log(content);


    if (!title || !cardImage || !mainImage  || !shortdesc || !category ||  !date || !content) {
      return next(new ErrorHandler("Please rpovide all fields.", 400))
    }
    // const blogExist = await BlogModel.find({title})
    // if (blogExist) {
    //   return next(new ErrorHandler("Blog already exists", 400))
    // }
    let parsedContent = JSON.parse(content); 
    console.log(parsedContent);
    
    const slug = createSlug(title)
  
    const cardImageId = await uploadImageToS3(cardImage);
    const mainImageId = await uploadImageToS3(mainImage);
    if (!cardImageId || !mainImageId) {
      return next(new ErrorHandler('unable to process images', 400)); 
    }
  
    // const cardImageId = await uploadImageToDrive(cardImage);
    const blog = await BlogModel.create({
      title, slug, cardImageId, mainImageId, shortdesc , category,  date, content : parsedContent,
    });
  
    if (!blog) {
      return next(new ErrorHandler('Unable to add blog', 500));
    }
  
    return res.status(200).json({
      status: 'Success',
      message: 'Blog added successfully',
      data: blog,
    });
  });

  

  const getSingleBlogController = asyncHandler(async (req, res, next) => {
    const {slug} = req.params
    const blog = await BlogModel.findOne({slug});
  
    if (!blog) {
      return next(new ErrorHandler('no Blog found'), 404);
    }
  
    return res.status(200).json(
      {
        status: 'Success',
        message: 'Request Successfull',
        data: blog,
      },
    );
  });


  const getAllBlogsController = asyncHandler(async (req, res, next) => {
    const blogs = await BlogModel.find({});
  
    if (!blogs.length ) {
      return next(new ErrorHandler('no Blogs found'), 404);
    }
  
    return res.status(200).json(
      {
        status: 'Success',
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

  const updateBlogController = asyncHandler(async (req, res, next) => {
    const { blogId } = req.params;
    const { title  , shortdesc  , category ,  date , content, } = req.body;
    const { files } = req;
  
    let blog = await BlogModel.findById(blogId);
  
    if (!blog) {
      return next(new ErrorHandler('Blog Not Found', 404));
    }
  
  
    if (files && files.length !== 0) {
      const fileId = blog.cardImageId;
      const fileId2 = blog.mainImageId;
      const updateImage = files.find((item) => item.fieldname === "cardImage");
      if (updateImage) {
        let updateImageId = await updateImageToS3(updateImage, fileId );
        blog.cardImageId = updateImageId;
      }
      const updateImage2 = files.find((item) => item.fieldname === "mainImage");
      if (updateImage2) {
        let updateImageId = await updateImageToS3( updateImage2, fileId2);
        blog.mainImageId = updateImageId;
      }

    }
  
    blog.title = title || blog.title;
    blog.shortdesc = shortdesc || blog.shortdesc;
    blog.category = category || blog.category;
    blog.date = date || blog.date;
    blog.content = JSON.parse(content)  || blog.content;
  
    await blog.save();
  
    return res.status(200).json({
      status: 'Success',
      // code: 200,
      message: 'Blog updated successfully',
      data: blog,
    });
  });

  const deleteBlogController = asyncHandler(async (req, res, next) => {
    const { blogId } = req.params;
  
    const deleteBlog =  await BlogModel.findByIdAndDelete(blogId).exec();
  
    if (!deleteBlog) {
      return next(new ErrorHandler('Blog Not Found', 404));
    }
  
    await deleteImageFromS3(deleteBlog.cardImage);
    return res.status(200).json({
      status: 'Success',
      
      message: 'Delete Blog SuccessFully',
    });
  });

  module.exports = {
    addBlogController, 
    getAllBlogsController,
    getSingleBlogController,
    updateBlogController,
    // getAllBlogs, getBlog, updateBlog, 
    deleteBlogController
}