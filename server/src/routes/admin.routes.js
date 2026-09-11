import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { reorderSchema } from '../validators/common.validators.js';

import * as artistCtrl from '../controllers/artist.controller.js';
import * as artworkCtrl from '../controllers/artwork.controller.js';
import * as contactCtrl from '../controllers/contact.controller.js';
import * as dashCtrl from '../controllers/dashboard.controller.js';
import * as journeyCtrl from '../controllers/journey.controller.js';
import * as letterCtrl from '../controllers/letter.controller.js';
import * as mediaCtrl from '../controllers/media.controller.js';
import * as moodCtrl from '../controllers/mood.controller.js';
import * as quoteCtrl from '../controllers/quote.controller.js';
import * as siteCtrl from '../controllers/site.controller.js';
import * as songCtrl from '../controllers/song.controller.js';
import * as worldCtrl from '../controllers/worldSettings.controller.js';

import { artistSchema } from '../validators/artist.validators.js';
import { artworkSchema } from '../validators/artwork.validators.js';
import { contactSettingsSchema } from '../validators/contact.validators.js';
import { milestoneSchema } from '../validators/journey.validators.js';
import { moodSchema } from '../validators/mood.validators.js';
import { quoteSchema } from '../validators/quote.validators.js';
import { siteSchema } from '../validators/site.validators.js';
import { songSchema } from '../validators/song.validators.js';
import { worldSettingsPatchSchema } from '../validators/worldSettings.validators.js';

const router = Router();

// Dashboard
router.get('/dashboard', dashCtrl.getDashboardStats);

// World Customization
router.get('/world', worldCtrl.getWorldSettings);
router.patch('/world', validate(worldSettingsPatchSchema), worldCtrl.updateWorldSettings);
router.post('/world/reset', worldCtrl.resetWorldSettings);
router.post('/world/reset/:section', worldCtrl.resetWorldSettings);

// Media
router.post('/media/signature', mediaCtrl.getUploadSignature);

// Site Settings
router.get('/site', siteCtrl.getSiteSettings);
router.patch('/site', validate(siteSchema), siteCtrl.updateSiteSettings);

// Artist
router.get('/artist', artistCtrl.getArtist);
router.patch('/artist', validate(artistSchema), artistCtrl.updateArtist);

// Quotes
router.get('/quotes', quoteCtrl.getQuotes);
router.post('/quotes', validate(quoteSchema), quoteCtrl.createQuote);
router.patch('/quotes/reorder', validate(reorderSchema), quoteCtrl.reorderQuotes);
router.patch('/quotes/:id', validate(quoteSchema), quoteCtrl.updateQuote);
router.delete('/quotes/:id', quoteCtrl.deleteQuote);

// Artworks
router.get('/artworks', artworkCtrl.getArtworks);
router.post('/artworks', validate(artworkSchema), artworkCtrl.createArtwork);
router.patch('/artworks/reorder', validate(reorderSchema), artworkCtrl.reorderArtworks);
router.patch('/artworks/:id', validate(artworkSchema), artworkCtrl.updateArtwork);
router.delete('/artworks/:id', artworkCtrl.deleteArtwork);

// Journey
router.get('/journey', journeyCtrl.getMilestones);
router.post('/journey', validate(milestoneSchema), journeyCtrl.createMilestone);
router.patch('/journey/reorder', validate(reorderSchema), journeyCtrl.reorderMilestones);
router.patch('/journey/:id', validate(milestoneSchema), journeyCtrl.updateMilestone);
router.delete('/journey/:id', journeyCtrl.deleteMilestone);

// Songs
router.get('/songs', songCtrl.getSongs);
router.post('/songs', validate(songSchema), songCtrl.createSong);
router.patch('/songs/reorder', validate(reorderSchema), songCtrl.reorderSongs);
router.patch('/songs/:id', validate(songSchema), songCtrl.updateSong);
router.delete('/songs/:id', songCtrl.deleteSong);

// Moods
router.get('/moods', moodCtrl.getMoods);
router.post('/moods', validate(moodSchema), moodCtrl.createMood);
router.patch('/moods/:id', validate(moodSchema), moodCtrl.updateMood);
router.delete('/moods/:id', moodCtrl.deleteMood);

// Contact Settings
router.get('/contact-settings', contactCtrl.getContactSettings);
router.patch('/contact-settings', validate(contactSettingsSchema), contactCtrl.updateContactSettings);

// Letters
router.get('/letters', letterCtrl.getLetters);
router.get('/letters/:id', letterCtrl.getLetter);
router.patch('/letters/:id/status', letterCtrl.updateLetterStatus);
router.delete('/letters/:id', letterCtrl.deleteLetter);

export default router;

