// const { asyncHandler } = require('../../utils/asyncHandler');
const { ErrorHandler } = require('../utils/errohandler');
const { AdminModel, UserModel } = require('../models');
const { asyncHandler } = require('../utils/asynhandler');
const jwt = require('jsonwebtoken');
const { environmentVariables } = require('../config');

const adminOnly = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from header
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorHandler('Not authorized to access this route', 401));
  }

  // Verify token
  const decoded = jwt.verify(token, environmentVariables.SECRET_KEY);

  // Find user by ID from the token
  const user = await UserModel.findById(decoded.id);

  // if (!admin || admin.userType !== 'Admin') {
  //   return next(
  //     new ErrorHandler('Access denied, only admins can access this route', 403)
  //   );
  // }
  // Attach admin to request object
  req.user = user;
  next();
});

module.exports = {adminOnly};