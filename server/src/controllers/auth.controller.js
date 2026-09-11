import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { authService } from '../services/auth.service.js';
import { tokenService } from '../services/token.service.js';
import { success } from '../utils/apiResponse.js';

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { admin, accessToken, refreshToken } = await authService.login(email, password);

  tokenService.setAccessCookie(res, accessToken);
  tokenService.setRefreshCookie(res, refreshToken);

  // Set CSRF token cookie for subsequent mutation requests
  const csrfToken = uuidv4();
  res.cookie('csrf_token', csrfToken, {
    httpOnly: false, // Must be readable by client JS to attach in X-CSRF-Token header
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.setHeader('X-CSRF-Token', csrfToken);

  return success(res, { data: { admin, csrfToken } });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies[env.COOKIE_REFRESH_NAME];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  const { accessToken, refreshToken } = await authService.refresh(token);

  tokenService.setAccessCookie(res, accessToken);
  tokenService.setRefreshCookie(res, refreshToken);

  let csrfToken = req.cookies['csrf_token'];
  if (!csrfToken) {
    csrfToken = uuidv4();
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
  }
  res.setHeader('X-CSRF-Token', csrfToken);

  return success(res, { message: 'Token refreshed', data: { csrfToken } });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies[env.COOKIE_REFRESH_NAME];
  await authService.logout(token);
  tokenService.clearAuthCookies(res);
  res.clearCookie('csrf_token');
  return success(res, { message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  const admin = await authService.getProfile(req.admin._id);

  let csrfToken = req.cookies['csrf_token'];
  if (!csrfToken) {
    csrfToken = uuidv4();
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
  }
  res.setHeader('X-CSRF-Token', csrfToken);

  return success(res, { data: { admin, csrfToken } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.admin._id, currentPassword, newPassword);

  tokenService.clearAuthCookies(res);
  res.clearCookie('csrf_token');

  return success(res, { message: 'Password changed successfully. Please log in again.' });
});
