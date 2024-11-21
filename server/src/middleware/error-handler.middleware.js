import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err.type === 'auth') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message
    });
  }

  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
}; 