import mongoose from 'mongoose';

const letterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  adminNote: { type: String }
}, { timestamps: true });

letterSchema.index({ status: 1, createdAt: -1 });
letterSchema.index({ createdAt: -1 });

export const Letter = mongoose.model('Letter', letterSchema);

