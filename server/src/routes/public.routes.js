import { Router } from 'express';
import { asyncHandler } from '../controllers/auth.controller.js'; // reuse handler wrapper
import { createLetter } from '../controllers/letter.controller.js';
import { contactLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { Artist } from '../models/Artist.js';
import { Artwork } from '../models/Artwork.js';
import { ContactSettings } from '../models/ContactSettings.js';
import { JourneyMilestone } from '../models/JourneyMilestone.js';
import { Mood } from '../models/Mood.js';
import { Quote } from '../models/Quote.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { Song } from '../models/Song.js';
import { worldSettingsService } from '../services/worldSettings.service.js';
import { success } from '../utils/apiResponse.js';
import { letterSchema } from '../validators/letter.validators.js';

const router = Router();

router.post('/letters', contactLimiter, validate(letterSchema), createLetter);

router.get('/content', asyncHandler(async (req, res) => {
  const [
    site,
    artist,
    quotes,
    artworks,
    journey,
    songs,
    moods,
    contact,
    world
  ] = await Promise.all([
    SiteSettings.findOne({ isPublished: true }).lean(),
    Artist.findOne({ isPublished: true }).lean(),
    Quote.find({ isPublished: true }).sort({ order: 1 }).lean(),
    Artwork.find({ isPublished: true }).sort({ order: 1 }).lean(),
    JourneyMilestone.find({ isPublished: true }).sort({ order: 1 }).lean(),
    Song.find({ isPublished: true }).sort({ order: 1 }).lean(),
    Mood.find({ isPublished: true }).sort({ order: 1 }).lean(),
    ContactSettings.findOne({ isPublished: true }).lean(),
    worldSettingsService.getPublicWorldSettings()
  ]);

  // Clean data for public consumption (preserve string ID, remove __v)
  const cleanDoc = (doc) => {
    if (!doc) return null;
    const { __v, ...rest } = doc;
    return {
      ...rest,
      _id: doc._id ? String(doc._id) : undefined,
      id: doc._id ? String(doc._id) : undefined,
    };
  };

  const cleanDocs = (docs) => docs.map(cleanDoc);

  // Map image and media fields for consistency in frontend
  const mapMedia = (media) => {
    if (!media) return undefined;
    const url = media.secureUrl || media.url || media.src;
    return {
      url,
      src: url,
      alt: media.alt || media.originalFilename || '',
      source: media.source || '',
      credit: media.credit || ''
    };
  };

  const safeArtist = cleanDoc(artist);
  if (safeArtist) {
    safeArtist.portrait = mapMedia(artist.portrait);
    safeArtist.smallImage = mapMedia(artist.smallImage);
  }

  const safeArtworks = cleanDocs(artworks).map((a) => ({
    ...a,
    image: a.image ? {
      src: a.image.secureUrl || a.image.url || a.image.src,
      url: a.image.secureUrl || a.image.url || a.image.src,
      alt: a.altText || a.image.alt || a.title || '',
      source: a.source || a.image.source || '',
      credit: a.credit || a.image.credit || ''
    } : undefined
  }));

  const safeJourney = cleanDocs(journey).map((j) => ({
    ...j,
    image: mapMedia(j.image)
  }));

  const safeSongs = cleanDocs(songs).map(s => ({
    ...s,
    audio: mapMedia(s.audio),
    cover: mapMedia(s.cover)
  }));

  const safeMoods = cleanDocs(moods).map((m) => ({
    ...m,
    slug:
      m.slug ||
      (m.name
        ? m.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        : undefined),
    songIds: Array.isArray(m.songIds) ? m.songIds.map((id) => String(id)) : [],
    worldEffect: m.worldEffect || undefined,
  }));

  return success(res, {
    data: {
      site: cleanDoc(site) || {},
      artist: safeArtist || {},
      quotes: cleanDocs(quotes),
      artworks: safeArtworks,
      journey: safeJourney,
      music: {
        songs: safeSongs,
        moods: safeMoods
      },
      contact: cleanDoc(contact) || {},
      world: world || {}
    }
  });
}));

export default router;

