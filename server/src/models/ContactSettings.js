import mongoose from 'mongoose';

const contactSettingsSchema = new mongoose.Schema({
  heading: String,
  intro: String,
  handwrittenNote: String,
  fieldLabels: {
    name: String,
    email: String,
    message: String
  },
  buttonText: String,
  successMessage: String,
  disclaimer: String,
  signoff: String,
  email: String,
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export const ContactSettings = mongoose.model('ContactSettings', contactSettingsSchema);

