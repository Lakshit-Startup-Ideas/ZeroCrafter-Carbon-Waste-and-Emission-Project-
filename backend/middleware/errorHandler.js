const { errorHelpers } = require('../shared');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        details: errors,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: {
        message: `${field} already exists`,
        statusCode: 400,
        code: 'DUPLICATE_ERROR',
        field,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(errorHelpers.authError('Invalid token'));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(errorHelpers.authError('Token expired'));
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        message: 'Invalid ID format',
        statusCode: 400,
        code: 'INVALID_ID',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = { errorHandler }; 