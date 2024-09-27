/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'Error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ErrorHandler(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue);
  const message = `Duplicate field '${field}'. Please use another value!`;
  return new ErrorHandler(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ErrorHandler(message, 400);
};

const handleJWTError = () => new ErrorHandler('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new ErrorHandler('Your token has expired! Please log in again.', 401);

// Send detailed errors in Development
const sendErrorDev = (err, req, res) => {
  console.error('ERROR 💥', err);
  if (req.originalUrl.startsWith('/')) {
    return res.status(err.statusCode).json({
      status: err.status,
      name: err.name,
      error: err,
      message: err.message,
      stack: err.stack, // Include stack trace for development
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  }
};

module.exports = { ErrorHandler, globalErrorHandler };
