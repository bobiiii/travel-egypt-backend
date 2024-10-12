const { asyncHandler } = require("../../utils/asynhandler")
const {  ErrorHandler } = require("../../utils/errohandler")
const { SubscribeModel} = require("../../models")

const getSubscribers = asyncHandler(async(req,res,next)=>{
    const subscribers = await SubscribeModel.find({})
    if (!subscribers.length) {
        return next(new ErrorHandler("No subscribers found", 404))
    }


    return res.status(200).json({
        status:"success",
        message:"Request successfull",
        data: subscribers
    })
})


const addSubscriber = asyncHandler(async(req,res,next)=>{
    const {email} = req.body

    if (!email) {
        return next(new ErrorHandler("Please provide email", 400))
       
    }
    const subscriberExist = await  SubscribeModel.find({
        email
    })

if (!subscriberExist) {
    return next(new ErrorHandler("Already Exist! Please choose different E-Mail", 400))
   
}
    const subscriber = await  SubscribeModel.create({
        email
    })
    if (!subscriber) {
        return next(new ErrorHandler("Unable to add subscriber", 404))
    }


    return res.status(200).json({
        status:"success",
        message:"Thank you! We will get back to you soon!",
        data: subscriber
    })
})

const deleteSubscriber = asyncHandler(async(req,res,next)=>{
    const {subscriberId} = req.params
    
    if (!subscriberId) {
        return next(new ErrorHandler("Please provide sunscriberId", 400))
    }
    const subscribers = await  SubscribeModel.findByIdAndDelete(subscriberId)
    if (!subscribers) {
        return next(new ErrorHandler("Unable to delete subscriber", 404))
    }


    return res.status(200).json({
        status:"success",
        message:"Subscriber deleted successfully",
        data: subscribers
    })
})



module.exports = {
    addSubscriber, getSubscribers, deleteSubscriber
}