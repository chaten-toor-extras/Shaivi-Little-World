import mongoose from 'mongoose';
import { mediaSchema } from './schemas/media.js';

const telescopeSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  x: { type: Number, min: 0, max: 100 },
  y: { type: Number, min: 0, max: 100 },
  depth: { type: Number, min: 0, max: 1, default: 0.5 },
  size: { type: String, enum: ['small', 'normal', 'featured'], default: 'normal' },
  glowColor: { type: String, default: '#C9B7E8' },
  constellationOrder: { type: Number }
}, { _id: false });

const journeyMilestoneSchema = new mongoose.Schema({
  title: String,
  year: String,
  text: String,
  image: mediaSchema,
  altText: String,
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  desktopPosition: {
    x: Number,
    y: Number
  },
  telescope: { type: telescopeSchema, default: () => ({}) }
}, { timestamps: true });

journeyMilestoneSchema.index({ order: 1 });
journeyMilestoneSchema.index({ isPublished: 1, order: 1 });

export const JourneyMilestone = mongoose.model('JourneyMilestone', journeyMilestoneSchema);


