import { Artwork } from '../models/Artwork.js';
import { JourneyMilestone } from '../models/JourneyMilestone.js';
import { Letter } from '../models/Letter.js';
import { Mood } from '../models/Mood.js';
import { Quote } from '../models/Quote.js';
import { Song } from '../models/Song.js';
import { success } from '../utils/apiResponse.js';
import { asyncHandler } from './auth.controller.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [artworks, quotes, songs, moods, milestones, unreadLetters, totalLetters] = await Promise.all([
    Artwork.countDocuments(),
    Quote.countDocuments(),
    Song.countDocuments(),
    Mood.countDocuments(),
    JourneyMilestone.countDocuments(),
    Letter.countDocuments({ status: 'unread' }),
    Letter.countDocuments()
  ]);

  return success(res, {
    data: {
      artworks,
      quotes,
      songs,
      moods,
      milestones,
      unreadLetters,
      totalLetters,
      counts: {
        artworks,
        quotes,
        songs,
        moods,
        milestones,
        letters: {
          unread: unreadLetters,
          total: totalLetters
        }
      }
    }
  });
});


