// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
require('dotenv').config();

const signToken = async (id) => jwt.sign({ id }, process.env.SECRET_KEY);

const sendCookieToken = async (user, statusCode, req, res) => {
  const token = await signToken(user.id);
  const {
     name, email,
  } = user;
  const message = 'User Successfully Login';
  const cookieOptions = {
    httpOnly: true,
    // sameSite: 'strict',
    // maxAge: process.env.JWT_MAX_AGE * 60 * 1000,
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'http',
  };
  res.cookie('token', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    name,
    email,
  });
};

module.exports = {
    sendCookieToken,
  };