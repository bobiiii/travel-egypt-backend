const {  deleteImageFromS3, updateImageToS3 } = require('../../middlewares/awsS3');
const { uploadImage, deleteImage, updateImageLocal } = require('../../middlewares/imageHandlers');
const {BlogModel} = require('../../models');
const {asyncHandler} = require('../../utils/asynhandler');
const { createSlug } = require('../../utils/createSlug');
const {ErrorHandler} = require('../../utils/errohandler');
const { extractImageIdsFromContent } = require('../../utils/imageIdExtractor');



const addBlogController = asyncHandler(async (req, res, next) => {
  const {files} = req
  
  const { title  , shortDesc  , category ,   content, } = req.body;
  const cardImage = files.find((item) => item.fieldname === 'cardImage');
  const blogBannerImage = files.find((item) => item.fieldname === 'blogBannerImage');
    
  if (!title || !cardImage || !blogBannerImage  || !shortDesc || !category || !content) {
      return next(new ErrorHandler("Please provide all fields.", 400))
    }
    const blogExist = await BlogModel.findOne({title})
    if (blogExist) {
      return next(new ErrorHandler("Blog already exists", 400))
    }


    // let parsedContent = JSON.parse(content); 
    
    
    
    const cardImageId = await uploadImage(cardImage, "blogs");
    const blogBannerImageId = await uploadImage(blogBannerImage, "blogs");
    if (!cardImageId || !blogBannerImageId) {
      return next(new ErrorHandler('unable to upload Card or Banner images', 400)); 
    }
    
    const slug = createSlug(title)
    // const updatedContent = convertContentImagesSrc(parsedContent);
    const contentImageIds = extractImageIdsFromContent(content);




    const blog = await BlogModel.create({
      title, slug, cardImage: cardImageId, blogBannerImage: blogBannerImageId, shortDesc, contentImageIds, category,  content : content,
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

  // const getBlog = asyncHandler(async (req, res, next) => {
  //   const { blogId } = req.params;
  
  //   const blog = await BlogModel.findById(blogId);
  
  //   if (!blog) {
  //     return next(new ErrorHandler('blog not found', 404));
  //   }

  
  //   return res.status(200).json(
  //     {
  //       status: 'Success',
  //       code: 200,
  //       message: 'Request SuccessFully',
  //       data: blog,
  //     },
  //   );
  // });

  const updateBlogController = asyncHandler(async (req, res, next) => {
    const { blogId } = req.params;
    const { title  , shortDesc  , category , content, } = req.body;
    const { files } = req;
  
    let blog = await BlogModel.findById(blogId);
  
    if (!blog) {
      return next(new ErrorHandler('Blog Not Found', 404));
    }
  
  
    if (files && files.length !== 0) {
      const fileId = blog.cardImage;
      const fileId2 = blog.blogBannerImage;
      const updateImage = files.find((item) => item.fieldname === "cardImage");
      if (updateImage) {
        let updateImageId = await updateImageLocal(updateImage, fileId, "blogs" );
        blog.cardImage = updateImageId;
      }
      const updateImage2 = files.find((item) => item.fieldname === "blogBannerImage");
      if (updateImage2) {
        let updateImageId = await updateImageLocal( updateImage2, fileId2, "blogs");
        blog.blogBannerImage = updateImageId;
      }

    }

    if (content) {
      const contentImageIds = extractImageIdsFromContent(content);
      blog.contentImageIds = contentImageIds  
      
    }

    if (title) {
      const slug = createSlug(title)
      blog.title = title ;
      blog.slug = slug 
      
    }
  

    blog.shortDesc = shortDesc || blog.shortDesc;
    blog.category = category || blog.category;
    blog.content = content  || blog.content;
  
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
  
    await deleteImage(deleteBlog.cardImage, "blogs");
    await deleteImage(deleteBlog.blogBannerImage, "blogs");

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