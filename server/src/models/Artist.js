import mongoose from 'mongoose';
import { mediaSchema } from './schemas/media.js';

const artistSchema = new mongoose.Schema({
  name: String,
  label: String,
  caption: String,
  bio: String,
  portrait: mediaSchema,
  smallImage: mediaSchema,
  annotationText: String,
  tags: [String],
  details: [{
    label: String,
    value: String,
    _id: false
  }],
  note: String,
  sectionHeading: String,
  sectionKicker: String,
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export const Artist = mongoose.model('Artist', artistSchema);

