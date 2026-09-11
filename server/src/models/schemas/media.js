import mongoose from 'mongoose';

export const mediaSchema = new mongoose.Schema({
  url: {
    type: String,
    default: function () {
      return this.src || '';
    },
  },
  src: {
    type: String,
    default: function () {
      return this.url || '';
    },
  },
  alt: { type: String, default: '' },
  source: { type: String, default: '' },
  credit: { type: String, default: '' },
  secureUrl: { type: String },
  publicId: { type: String },
  resourceType: { type: String, default: 'image' },
  format: { type: String },
  width: { type: Number },
  height: { type: Number },
  bytes: { type: Number },
  duration: { type: Number },
  originalFilename: { type: String },
}, { _id: false });

mediaSchema.pre('validate', function () {
  if (this.url && !this.src) {
    this.src = this.url;
  }
  if (this.src && !this.url) {
    this.url = this.src;
  }
});
