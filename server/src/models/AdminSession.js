import mongoose from 'mongoose';

const adminSessionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  jti: {
    type: String,
    required: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
  revokedAt: {
    type: Date,
  },
}, { timestamps: true });

adminSessionSchema.statics.revokeAllForAdmin = async function (adminId) {
  return this.updateMany(
    { adminId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
};

export const AdminSession = mongoose.model('AdminSession', adminSessionSchema);

