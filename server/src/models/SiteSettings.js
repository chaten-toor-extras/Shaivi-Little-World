import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  title: String,
  description: String,
  wordmark: String,
  introHeading: String,
  introSubtext: String,
  introDescription: String,
  exploreLabel: String,
  sectionLabels: {
    type: Map,
    of: String
  },
  footerWorldText: String,
  footerExploreText: String,
  footerWorldInstruction: String,
  footerExploreInstruction: String,
  discoveryLabel: String,
  secretMessages: [String],
  socialLinks: [{
    label: String,
    url: String,
    _id: false
  }],
  accentColor: String,
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

