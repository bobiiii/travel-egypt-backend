const { MessageModel } = require("../../models")
const { asyncHandler } = require("../../utils/asynhandler")
const { ErrorHandler } = require("../../utils/errohandler")
const nodemailer = require('nodemailer');

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

const transporter = nodemailer.createTransport({
    host: 'web153.alfahosting-server.de', // Replace with your SMTP host
    port: 465, // Use 465 for secure connections, 587 for STARTTLS
    secure: true, // Set to true for port 465
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });


const mailOptions = {
    from: email,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Contact Request',
        text: `
New message received:

Name: ${name}
Email: ${email}
Message: ${message}`,
replyTo: email,
  };
const messageDeliver = await transporter.sendMail(mailOptions);
if (!messageDeliver) {
    return next(ErrorHandler("unable to send message to Admin", 500))
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