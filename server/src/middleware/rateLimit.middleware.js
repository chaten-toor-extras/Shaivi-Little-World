import rateLimit from 'express-rate-limit';

const realLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export const loginLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  return realLoginLimiter(req, res, next);
};

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  message: { success: false, message: 'Too many messages sent, please try again later' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

