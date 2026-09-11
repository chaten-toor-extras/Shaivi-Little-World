import mongoose from 'mongoose';

const worldEffectSceneSchema = new mongoose.Schema(
  {
    tint: { type: String, default: '#baa4df' },
    tintStrength: { type: Number, default: 0.2, min: 0, max: 1 },
    fogMultiplier: { type: Number, default: 1.0, min: 0.5, max: 1.5 },
  },
  { _id: false }
);

const worldEffectLightingSchema = new mongoose.Schema(
  {
    intensityMultiplier: { type: Number, default: 1.0, min: 0.5, max: 1.5 },
    tint: { type: String, default: '#c7b4e9' },
    tintStrength: { type: Number, default: 0.15, min: 0, max: 1 },
  },
  { _id: false }
);

const worldEffectAtmosphereSchema = new mongoose.Schema(
  {
    starBrightnessMultiplier: { type: Number, default: 1.0, min: 0, max: 2 },
    fireflyMultiplier: { type: Number, default: 1.0, min: 0, max: 2 },
    cloudSpeedMultiplier: { type: Number, default: 1.0, min: 0.25, max: 2 },
    cloudTint: { type: String, default: '#baa4df' },
    cloudTintStrength: { type: Number, default: 0.15, min: 0, max: 1 },
    moonBrightnessMultiplier: { type: Number, default: 1.0, min: 0.5, max: 2 },
    windowGlowMultiplier: { type: Number, default: 1.0, min: 0.5, max: 2 },
    lampGlowMultiplier: { type: Number, default: 1.0, min: 0.5, max: 2 },
  },
  { _id: false }
);

const worldEffectEnvironmentSchema = new mongoose.Schema(
  {
    pondTint: { type: String, default: '#8f87bb' },
    pondTintStrength: { type: Number, default: 0.2, min: 0, max: 1 },
    flowerBrightnessMultiplier: { type: Number, default: 1.0, min: 0.5, max: 1.5 },
  },
  { _id: false }
);

const worldEffectMotionSchema = new mongoose.Schema(
  {
    globalSpeedMultiplier: { type: Number, default: 1.0, min: 0.5, max: 1.5 },
  },
  { _id: false }
);

const worldEffectSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    intensity: { type: Number, default: 1.0, min: 0, max: 1 },
    scene: { type: worldEffectSceneSchema, default: () => ({}) },
    lighting: { type: worldEffectLightingSchema, default: () => ({}) },
    atmosphere: { type: worldEffectAtmosphereSchema, default: () => ({}) },
    environment: { type: worldEffectEnvironmentSchema, default: () => ({}) },
    motion: { type: worldEffectMotionSchema, default: () => ({}) },
  },
  { _id: false }
);

const moodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
    paperColor: { type: String, default: '#d7ddc5' },
    inkColor: { type: String, default: '#354537' },
    songIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    worldEffect: { type: worldEffectSchema },
  },
  { timestamps: true }
);

// Pre-save hook to ensure slug is set if missing
moodSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

moodSchema.index({ order: 1 });
moodSchema.index({ slug: 1 });

export const Mood = mongoose.model('Mood', moodSchema);

