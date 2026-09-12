import mongoose from 'mongoose';

const placementSchema = new mongoose.Schema(
  {
    anchor: {
      type: String,
      enum: [
        'POND_EDGE',
        'HOUSE_GARDEN',
        'TREE_CLUSTER',
        'BENCH',
        'BRIDGE',
        'ART_WALL',
        'TELESCOPE_BASE',
        'MAILBOX_AREA',
        'CLOCK_AREA',
        'FLOWER_FIELD',
        'ISLAND_PATH',
      ],
      default: 'POND_EDGE',
    },
    offset: {
      x: { type: Number, default: 0, min: -2, max: 2 },
      y: { type: Number, default: 0, min: -1, max: 2 },
      z: { type: Number, default: 0, min: -2, max: 2 },
    },
    visibleInPeriods: [
      {
        type: String,
        enum: ['MORNING', 'DAY', 'SUNSET', 'NIGHT'],
      },
    ],
    requiredMood: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mood',
      default: null,
    },
  },
  { _id: false }
);

const modelConfigSchema = new mongoose.Schema(
  {
    modelKey: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'tiny_star',
        'pressed_flower',
        'paint_brush',
        'paper_crane',
        'polaroid',
        'moon_charm',
        'music_note',
        'golden_wing',
        'crystal',
        'tiny_letter',
      ],
      default: 'tiny_star',
    },
    scalePreset: {
      type: String,
      enum: ['TINY', 'SMALL', 'NORMAL', 'FEATURED'],
      default: 'NORMAL',
    },
    rotationPreset: {
      type: String,
      enum: ['DEFAULT', 'UPRIGHT', 'FLAT', 'TILTED'],
      default: 'DEFAULT',
    },
  },
  { _id: false }
);

const appearanceSchema = new mongoose.Schema(
  {
    glowColor: { type: String, default: '#ffe8b2' },
    accentColor: { type: String, default: '#d4a373' },
    idleAnimation: {
      type: String,
      enum: ['FLOAT', 'SLOW_SPIN', 'SOFT_PULSE', 'NONE'],
      default: 'FLOAT',
    },
    revealEffect: {
      type: String,
      enum: ['NONE', 'SPARKLE', 'GLOW', 'TINY_STARS', 'PETALS', 'SOFT_PULSE'],
      default: 'SPARKLE',
    },
  },
  { _id: false }
);

const collectibleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Collectible name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [80, 'Slug cannot exceed 80 characters'],
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be lowercase alphanumeric with hyphens',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    hint: {
      type: String,
      trim: true,
      maxlength: [200, 'Hint cannot exceed 200 characters'],
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'STAR',
        'FLOWER',
        'ART',
        'MEMORY',
        'MUSIC',
        'LETTER',
        'NATURE',
        'MAGIC',
      ],
      default: 'STAR',
    },
    rarity: {
      type: String,
      enum: ['COMMON', 'SPECIAL', 'RARE'],
      default: 'COMMON',
    },
    source: {
      type: String,
      enum: ['WORLD', 'SECRET'],
      default: 'WORLD',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    model: {
      type: modelConfigSchema,
      default: () => ({}),
    },
    appearance: {
      type: appearanceSchema,
      default: () => ({}),
    },
    placement: {
      type: placementSchema,
      default: () => ({}),
    },
    behavior: {
      hideAfterCollected: {
        type: Boolean,
        default: true,
      },
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin note cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

collectibleSchema.index({ order: 1 });
collectibleSchema.index({ enabled: 1, isPublished: 1 });
collectibleSchema.index({ source: 1 });

export const Collectible = mongoose.model('Collectible', collectibleSchema);
