const { asyncHandler } = require("../../utils/asynhandler")

const getMetadata = asyncHandler((req,res,next)=>{
    return res.status(200).json({
        status: 'Success',
        message: 'Metadata added successfully',
        // data: booking,
      });
}) 

const addMetadata = asyncHandler((req,res,next)=>{
    return res.status(200).json({
        status: 'Success',
        message: 'Metadata added successfully',
        // data: booking,
      });
}) 
const updateMetadata = asyncHandler((req,res,next)=>{
    return res.status(200).json({
        status: 'Success',
        message: 'Metadata added successfully',
        // data: booking,
      });
}) 
const deleteMetadata = asyncHandler((req,res,next)=>{
    return res.status(200).json({
        status: 'Success',
        message: 'Metadata added successfully',
        // data: booking,
      });
}) 



module.exports = {
    getMetadata,
addMetadata,
updateMetadata,
deleteMetadata,
}