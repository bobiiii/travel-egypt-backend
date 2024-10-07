const { MessageModel } = require("../../models")
const { asyncHandler } = require("../../utils/asynhandler")
const { ErrorHandler } = require("../../utils/errohandler")

const getMessages = asyncHandler(async(req,res,next)=>{
    // const {name, email , message} = req.body
    // if (!name || !email || !message) {
    //     return next(ErrorHandler("Please provide all required fields", 400))
    // }
    
    const messages = await MessageModel.find({})
    
    if (!messages.length) {
        return next(ErrorHandler("No messages found", 400))
    }
    
    return res.status(200).json({
        status: 'Success',
        message: 'Message sent successfully',
        data: messages,
    })
    })




const addMessage = asyncHandler(async(req,res,next)=>{
const {name, email , message} = req.body
if (!name || !email || !message) {
    return next(ErrorHandler("Please provide all required fields", 400))
}

const addMessage = await MessageModel.create({
    name, 
    email , 
    message
})

if (!addMessage) {
    return next(ErrorHandler("Unable to add message", 400))
}

return res.status(200).json({
    status: 'Success',
    message: 'Message sent successfully',
    data: addMessage,
})
})



const deleteMessage = asyncHandler(async(req,res,next)=>{
    const {messageId} = req.params
    if (!messageId) {
        return next(ErrorHandler("Please provide message ID", 400))
    }
    
    const deletedMessage = await MessageModel.findByIdAndDelete(messageId)
    
    if (!deletedMessage) {
        return next(ErrorHandler("Unable to delete message", 400))
    }
    
    return res.status(200).json({
        status: 'Success',
        message: 'Message deleted successfully',
        data: deletedMessage,
    })
    })

module.exports =  {
    addMessage,
    getMessages,
    deleteMessage
} 