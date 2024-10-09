const bcrypt = require('bcrypt');
const { asyncHandler } = require("../../utils/asynhandler")
const { ErrorHandler } = require("../../utils/errohandler");
const { sendCookieToken } = require('../../utils/cookieToken');
const { UserModel } = require('../../models');

const loginUserController = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return next(new ErrorHandler('Please fill all required fields', 400));
    }
  
    const user = await UserModel.findOne({ email });
    if (!user) {
      return next(new ErrorHandler('User doesn\'t exist', 404));
    }
  
    const userExist = await bcrypt.compare(password, user.password);
  
    if (!userExist) {
      return next(new ErrorHandler('Email or password is incorrect', 401));
    }
  
    return sendCookieToken(user, 200, req, res);
  });




const getAllUsers = asyncHandler(async(req,res,next)=>{
const users = await UserModel.find({})
if (!users.length) {
    return next(ErrorHandler("No users found", 404))
}

return res.status(200).json({
    status: 'Success',
    message: 'Request successfully',
    data: users,
})
})


const addUser = asyncHandler(async(req,res,next)=>{
    const {name, email, password} = req.body
    
    if (!name || !email || !password ) {
        return next(ErrorHandler("Please  provide all required fields", 400))
    }

    const userExist = await UserModel.findOne({ email });
    if (userExist) {
      return next(new ErrorHandler('User already exists', 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const adduser = await UserModel.create({
        name, email, password: hashedPassword
    })
    if (!adduser) {
        return next(ErrorHandler("Unable to add user", 404))
    }
    
    return res.status(200).json({
        status: 'Success',
        message: 'Request successfully',
        data: adduser,
    })
    })


    const updateUser = asyncHandler(async(req,res,next)=>{
        const {userId} = req.params
        const {name, email, password} = req.body
        
        const user = await UserModel.findById(userId);

        if (!user) {
          return next(new ErrorHandler('User dosent  exists', 404));
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword
            
        }
        user.name = name || user.name
        user.email = email || user.email

        await user.save()
        
        
        return res.status(200).json({
            status: 'Success',
            message: 'User updated successfully',
            data: user,
        })
        })

        const deleteUser = asyncHandler(async(req,res,next)=>{
            const {userId} = req.params
            if (!userId) {
                return next(ErrorHandler("Please provide userUd", 404))
            }
            const user = await UserModel.findByIdAndDelete(userId)
            
            if (!user) {
                return next(ErrorHandler("Unable to delete user", 400))
            }
            
            return res.status(200).json({
                status: 'Success',
                message: 'User removed successfully',
                data: user,
            })
            })

module.exports = {
    loginUserController,  getAllUsers,  addUser, updateUser, deleteUser
}