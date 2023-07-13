const AppError = require('../utils/appError');

const handleTokenExpired = () =>
  new AppError('Token expired. Please log in again', 401);

const handleJWTError = () =>
  new AppError('Invalid Token. Please log in again', 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const values = Object.values(err.keyValue);
  const message = `Duplicate field value: ${values.join(
    '. '
  )}, please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((element) => element.message);
  const message = `Invalid input data; ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, response) => {
  response.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, response) => {
  if (err.isOperational) {
    response.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR:', err);
    response.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
  }
};

module.exports = (err, request, response, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, response);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleTokenExpired();
    sendErrorProd(error, response);
  }
};
