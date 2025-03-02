const { uploadImage, deleteImage } = require("../../middlewares/imageHandlers");
const { asyncHandler } = require("../../utils/asynhandler");
const { ErrorHandler } = require("../../utils/errohandler");


const uploadInternalImage = asyncHandler(async(req,res,next)=>{

    const { files } = req
    const blogInternalImage = files.find((item) => item.fieldname === 'blogInternalImage');


    let fileName;

    if (blogInternalImage) {
        fileName = await uploadImage(blogInternalImage, "blogs");
        
    }else{
        return next(new ErrorHandler('Please provide blogInternalImage! ', 400));

    }


    return res.status(200).json({
        status: 'Success',
        message: 'Image uploaded successfully',
        fileId: fileName,
        
    })

})



const deleteInternalImage = asyncHandler(async(req,res,next)=>{

    const { imageId } = req.body;

    if (!imageId) {
        return next(new ErrorHandler('Please provide imageId! ', 400));
    }

        await deleteImage(imageId, "blogs")
        




    return res.status(200).json({
        status: 'Success',
        message: 'Internal Image deleted successfully',
        
    })

})



module.exports =  {
    uploadInternalImage, deleteInternalImage
} 