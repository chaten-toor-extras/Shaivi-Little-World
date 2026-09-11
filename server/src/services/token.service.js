import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const tokenService = {
  generateAccessToken(admin) {
    return jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );
  },

  generateRefreshToken(admin, jti) {
    return jwt.sign(
      { id: admin._id, jti },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );
  },

  verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  },

  verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  },

  getCookieOptions() {
    const isProd = env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/'
    };
  },

  setAccessCookie(res, token) {
    // 15 minutes by default if not parseable, you should parse the string properly if needed
    res.cookie(env.COOKIE_ACCESS_NAME, token, { ...this.getCookieOptions(), maxAge: 15 * 60 * 1000 });
  },

  setRefreshCookie(res, token) {
    res.cookie(env.COOKIE_REFRESH_NAME, token, { ...this.getCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
  },

  clearAuthCookies(res) {
    res.clearCookie(env.COOKIE_ACCESS_NAME, this.getCookieOptions());
    res.clearCookie(env.COOKIE_REFRESH_NAME, this.getCookieOptions());
    res.clearCookie('csrf_token');
  }
};

