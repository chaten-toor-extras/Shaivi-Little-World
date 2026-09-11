import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Admin } from '../models/Admin.js';
import { AdminSession } from '../models/AdminSession.js';
import { AppError } from '../utils/AppError.js';
import { tokenService } from './token.service.js';

export const authService = {
  async login(email, password) {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const admin = await Admin.findOne({ email: normalizedEmail }).select('+passwordHash +isActive');
    if (!admin || !admin.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const jti = uuidv4();
    const accessToken = tokenService.generateAccessToken(admin);
    const refreshToken = tokenService.generateRefreshToken(admin, jti);

    const tokenHash = await bcrypt.hash(refreshToken, 10);

    // Refresh token expiry calculation
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await AdminSession.create({
      adminId: admin._id,
      jti,
      tokenHash,
      expiresAt
    });

    admin.passwordHash = undefined;

    return { admin, accessToken, refreshToken };
  },

  async refresh(refreshToken) {
    const payload = tokenService.verifyRefreshToken(refreshToken);

    const session = await AdminSession.findOne({ jti: payload.jti, revokedAt: null });
    if (!session) {
      throw new AppError('Session expired or revoked', 401);
    }

    const isMatch = await bcrypt.compare(refreshToken, session.tokenHash);
    if (!isMatch) {
      throw new AppError('Invalid refresh token', 401);
    }

    const admin = await Admin.findById(payload.id);
    if (!admin || !admin.isActive) {
      throw new AppError('Admin not found or inactive', 401);
    }

    // Revoke old session
    session.revokedAt = new Date();
    await session.save();

    // Create new
    const newJti = uuidv4();
    const newAccessToken = tokenService.generateAccessToken(admin);
    const newRefreshToken = tokenService.generateRefreshToken(admin, newJti);
    const newTokenHash = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await AdminSession.create({
      adminId: admin._id,
      jti: newJti,
      tokenHash: newTokenHash,
      expiresAt
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken) {
    if (!refreshToken) return;
    try {
      const payload = tokenService.verifyRefreshToken(refreshToken);
      await AdminSession.findOneAndUpdate(
        { jti: payload.jti, revokedAt: null },
        { revokedAt: new Date() }
      );
    } catch (e) {
      // Ignore token verification errors on logout
    }
  },

  async changePassword(adminId, currentPassword, newPassword) {
    const admin = await Admin.findById(adminId).select('+passwordHash');
    if (!admin) throw new AppError('Admin not found', 404);

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) throw new AppError('Incorrect current password', 400);

    admin.passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '10', 10));
    admin.passwordChangedAt = new Date();
    await admin.save();

    await AdminSession.revokeAllForAdmin(adminId);
  },

  async getProfile(adminId) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new AppError('Admin not found', 404);
    return admin;
  }
};

