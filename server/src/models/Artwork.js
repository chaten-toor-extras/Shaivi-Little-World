import mongoose from 'mongoose';
import { mediaSchema } from './schemas/media.js';

const artworkSchema = new mongoose.Schema({
  title: String,
  year: String,
  caption: String,
  altText: String,
  source: String,
  credit: String,
  image: mediaSchema,
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  initialPosition: {
    x: Number,
    y: Number
  },
  rotation: Number,
  scale: Number
}, { timestamps: true });

artworkSchema.index({ order: 1 });
artworkSchema.index({ isPublished: 1, order: 1 });

export const Artwork = mongoose.model('Artwork', artworkSchema);

