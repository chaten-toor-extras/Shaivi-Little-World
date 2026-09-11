import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const csrfProtection = (req, res, next) => {
  // Only protect mutations
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // 1. Verify Origin/Referer header (standard for decoupled cross-origin web apps)
  const origin = req.headers['origin'] || req.headers['referer'];
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const cleanOrigin = originUrl.origin.replace(/\/$/, '').toLowerCase();

      const envUrls = env.CLIENT_URL ? env.CLIENT_URL.split(',').map((u) => u.trim()) : [];
      const allowedOrigins = [
        ...envUrls,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
      ]
        .filter(Boolean)
        .map((o) => o.replace(/\/$/, '').toLowerCase());

      if (allowedOrigins.includes(cleanOrigin)) {
        return next();
      }
    } catch {
      // If URL parsing fails, fall through to token check
    }
  }

  // 2. Double-submit cookie verification
  const csrfCookie = req.cookies['csrf_token'];
  const csrfHeader = req.headers['x-csrf-token'];

  if (csrfCookie && csrfHeader && csrfCookie === csrfHeader) {
    return next();
  }

  return next(new AppError('Invalid CSRF token', 403));
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
