const ApiResponse = require('../utils/apiResponse');

// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Centralized error handler
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    message = `Resource not found with id of ${err.value}`;
    statusCode = 404;
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => val.message);
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Authentication token expired, please log in again';
    statusCode = 401;
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File size limit exceeded (max 5MB allowed)';
    statusCode = 400;
  }

  return ApiResponse.error(res, message, statusCode, errors);
};

module.exports = { notFound, errorHandler };
