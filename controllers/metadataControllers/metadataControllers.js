const {  updateImageToS3 } = require("../../middlewares/awsS3");
const { uploadImage, updateImageLocal } = require("../../middlewares/imageHandlers");
const { MetadataModel } = require("../../models/tour.model");
const { asyncHandler } = require("../../utils/asynhandler");
const { ErrorHandler } = require("../../utils/errohandler");

const getMetadata = asyncHandler(async (req, res, next) => {
const {entityId} = req.params

if (!entityId) {
    return next(new ErrorHandler('please provide entityId  ', 400));
}

    const metadata = await MetadataModel.findOne({ entityId });
    if (!metadata) {
        return next(new ErrorHandler('No metadata found  ', 400));
    }


    return res.status(200).json({
        status: 'Success',
        message: 'Request successfully',
        data: metadata,
    });
})



const getAllMetadata = asyncHandler(async (req, res, next) => {
    const { entityType } = req.query;
    if (!entityType) {
        return next(new ErrorHandler('Please provide entity type', 400));
    }

        const metadata = await MetadataModel.find({entityType});
        if (!metadata) {
            return next(new ErrorHandler('No metadata found', 400));
        }
    
        return res.status(200).json({
            status: 'Success',
            message: 'Request successfully',
            data: metadata,
        });
    })

const addMetadata = asyncHandler(async (req, res, next) => {
    const { files } = req
    const { entityId, entityType, title,
        description,
        canonical,
        ogSitename,
        ogTitle,
        ogDescription,
        ogURL,
        ogImageAlt 
    } = req.body;


    if (!entityId || !entityType || !title || !description  || !canonical || !ogSitename || !ogTitle || !ogDescription || !ogURL || !ogImageAlt   ) {
        return next(new ErrorHandler('Please fill all required fields  ', 400));

    }


    const existingMetadata = await MetadataModel.findOne({ entityId });
    
    if (existingMetadata) {
        return next(new ErrorHandler('Metadata already exists  ', 400));

    } 


    let uploadtoS3;
    
    const openGraphImage = files.find((item) => item.fieldname === 'ogImage');

    
    if (openGraphImage) {
        uploadtoS3 = await uploadImage(openGraphImage, "metadata");
        
    }else{
        return next(new ErrorHandler('Please provide ogImage! ', 400));

    }
    const metadata = await MetadataModel.create({
        entityId,
        entityType,
        title,
         description,
            canonical,
            ogSitename,
            ogTitle,
            ogDescription,
            ogURL,
            ogImageId : uploadtoS3,
            ogImageAlt }, );



    return res.status(200).json({
        status: 'Success',
        message: 'Metadata added/updated successfully',
        data: metadata,
    });
})


const updateMetadata = asyncHandler(async(req, res, next) => {
    const {metadataId} = req.params
    const { files } = req
    const {
         entityId, 
        title,
        description,
        canonical,
        ogSitename,
        ogTitle,
        ogDescription,
        ogURL,
        ogImageAlt 
    } = req.body;
    
    
    if (!metadataId) {
        return next(new ErrorHandler('Please provide metadata ID  ', 400));
    }

    const metadata = await MetadataModel.findById(metadataId);
    if (!metadata) {
        return next(new ErrorHandler('No metadata found  ', 400));
    }

    const openGraphImage = files.find((item) => item.fieldname === 'ogImage');
    
    if (openGraphImage) {
        metadata.ogImageId = await updateImageLocal(openGraphImage, metadata.ogImageId, "metadata" );
        
    }


    metadata.entityId = entityId || metadata.entityId
    metadata.title = title || metadata.title
    metadata.description = description || metadata.description
    metadata.canonical = canonical || metadata.canonical
    metadata.ogSitename = ogSitename || metadata.ogSitename
    metadata.ogTitle = ogTitle || metadata.ogTitle
    metadata.ogDescription = ogDescription || metadata.ogDescription
    metadata.ogURL = ogURL || metadata.ogURL
    metadata.ogImageAlt = ogImageAlt || metadata.ogImageAlt
    
    const updatedmetadata = await metadata.save()
    if (!updatedmetadata) {
        return next(new ErrorHandler('Unable to update metadata  ', 400));
    }

    return res.status(200).json({
        status: 'Success',
        message: 'Metadata updated successfully',
        data: updatedmetadata,
    });

})



const deleteMetadata = asyncHandler(async(req, res, next) => {
    const {metadataId} = req.params
    if (!metadataId) {
        return next(new ErrorHandler('Please provide metadata ID  ', 400));
    }

    const metadata = await MetadataModel.findByIdAndDelete(metadataId);
    if (!metadata) {
        return next(new ErrorHandler('No metadata found  ', 400));
    }

    return res.status(200).json({
        status: 'Success',
        message: 'Metadata deleted successfully',
        data: metadata,
    });

})



module.exports = {
    getMetadata,
    getAllMetadata,
    addMetadata,
    updateMetadata,
    deleteMetadata,
}