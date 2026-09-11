import { env } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import { tokenService } from '../services/token.service.js';
import { AppError } from '../utils/AppError.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies[env.COOKIE_ACCESS_NAME];

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = tokenService.verifyAccessToken(token);
    const admin = await Admin.findById(payload.id).select('+isActive');

    if (!admin || !admin.isActive) {
      throw new AppError('Invalid or inactive account', 401);
    }

    if (admin.passwordChangedAt && payload.iat < admin.passwordChangedAt.getTime() / 1000) {
      throw new AppError('Password recently changed. Please log in again', 401);
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired token', 401));
    } else {
      next(error);
    }
  }
};

