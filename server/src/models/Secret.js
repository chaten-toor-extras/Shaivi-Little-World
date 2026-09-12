import mongoose from 'mongoose';
import { mediaSchema } from './schemas/media.js';

const targetSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'BUTTERFLY',
        'FLYING_PAGE',
        'FLYING_PAPER',
        'LAMP',
        'POND',
        'TREE',
        'BOOKS',
        'HOUSE_WINDOW',
        'TELESCOPE',
        'MAILBOX',
        'CLOCK',
        'FLOWERS',
        'BENCH',
        'WORLD',
        'SECTION',
      ],
    },
    id: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const triggerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'CLICK',
        'MULTI_CLICK',
        'HOVER',
        'TOGGLE',
        'RIPPLE',
        'SHAKE',
        'VISIT_SECTION',
        'LETTER_SENT',
        'JOURNEY_VIEWED',
        'MOOD_SELECTED',
        'TIME_ENTERED',
        'CUSTOM_EVENT',
      ],
    },
    requiredCount: { type: Number, default: 1, min: 1 },
    windowMs: { type: Number, default: 0, min: 0 },
    eventName: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const conditionsSchema = new mongoose.Schema(
  {
    timeOfDay: [
      {
        type: String,
        enum: ['MORNING', 'DAY', 'SUNSET', 'NIGHT'],
      },
    ],
    moods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mood',
      },
    ],
    sectionsVisited: [
      {
        type: String,
        enum: ['ABOUT', 'QUOTES', 'GALLERY', 'JOURNEY', 'CONTACT', 'MUSIC'],
      },
    ],
    letterSent: { type: Boolean, default: false },
    journeyViewed: { type: Boolean, default: false },
    requiresSecretIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Secret',
      },
    ],
  },
  { _id: false }
);

const revealSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'MESSAGE',
        'IMAGE',
        'QUOTE',
        'SOUND',
        'VISUAL_EFFECT',
        'COLLECTIBLE',
        'COLLECTIBLE_PLACEHOLDER',
        'CUSTOM',
      ],
      default: 'MESSAGE',
    },
    title: { type: String, trim: true, maxlength: 80, default: '' },
    message: { type: String, trim: true, maxlength: 500, default: '' },
    position: {
      type: String,
      enum: ['center', 'bottom-center', 'near-target'],
      default: 'center',
    },
    duration: {
      type: String,
      enum: ['SHORT', 'NORMAL', 'LONG', 'UNTIL_CLOSED'],
      default: 'NORMAL',
    },
    image: mediaSchema,
    quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
    collectibleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collectible' },
    quoteText: { type: String, trim: true, default: '' },
    quoteAuthor: { type: String, trim: true, default: '' },
    soundUrl: { type: String, trim: true, default: '' },
    soundVolume: { type: Number, min: 0, max: 1, default: 0.5 },
    visualEffect: {
      type: String,
      enum: ['NONE', 'SPARKLE', 'GLOW', 'TINY_STARS', 'PETALS', 'SOFT_PULSE'],
      default: 'NONE',
    },
  },
  { _id: false }
);

const behaviorSchema = new mongoose.Schema(
  {
    repeatable: { type: Boolean, default: false },
    cooldownMs: { type: Number, default: 0, min: 0 },
    oncePerSession: { type: Boolean, default: false },
  },
  { _id: false }
);

const secretSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      immutable: true, // Immutable after creation to preserve localStorage progress
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
    target: {
      type: targetSchema,
      required: true,
    },
    trigger: {
      type: triggerSchema,
      required: true,
    },
    conditions: {
      type: conditionsSchema,
      default: () => ({}),
    },
    reveal: {
      type: revealSchema,
      required: true,
    },
    behavior: {
      type: behaviorSchema,
      default: () => ({}),
    },
    adminNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);


secretSchema.index({ order: 1 });
secretSchema.index({ isPublished: 1, enabled: 1, order: 1 });

export const Secret = mongoose.model('Secret', secretSchema);

