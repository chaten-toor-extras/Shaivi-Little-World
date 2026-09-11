import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/AppError.js';

export const csrfProtection = (req, res, next) => {
  // Only protect mutations
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies['csrf_token'];
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return next(new AppError('Invalid CSRF token', 403));
  }

  next();
};

export const setCsrfCookie = (req, res, next) => {
  if (req.admin && !req.cookies['csrf_token']) {
    const token = uuidv4();
    res.cookie('csrf_token', token, {
      httpOnly: false, // Must be accessible to JS to send in header
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
  }
  next();
};
