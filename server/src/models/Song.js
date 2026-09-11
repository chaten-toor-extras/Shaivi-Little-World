import mongoose from 'mongoose';
import { mediaSchema } from './schemas/media.js';

const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  cover: mediaSchema,
  audio: mediaSchema,
  duration: Number,
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

songSchema.index({ order: 1 });
songSchema.index({ isPublished: 1, order: 1 });

export const Song = mongoose.model('Song', songSchema);

