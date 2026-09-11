import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

quoteSchema.index({ order: 1 });
quoteSchema.index({ isPublished: 1, order: 1 });

export const Quote = mongoose.model('Quote', quoteSchema);

