import { env } from '../config/env.js';
import { error as sendError } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export const globalErrorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }
  if (err.code === 11000) {
    error = new AppError('Duplicate field value entered', 409);
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => ({ path: el.path, message: el.message }));
    error = new AppError('Invalid input data', 422, errors);
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = new AppError('Invalid or expired token', 401);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal Server Error';

  if (statusCode === 500) {
    logger.error({ err }, 'Unhandled Exception');
  }

  const response = { statusCode, message };
  if (error.errors) response.errors = error.errors;

  // Expose stack only in dev
  if (env.NODE_ENV === 'development') {
    response.errors = response.errors || [];
    response.errors.push({ stack: err.stack });
  }

  return sendError(res, response);
};

