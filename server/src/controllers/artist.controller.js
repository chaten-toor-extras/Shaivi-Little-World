import { Artist } from '../models/Artist.js';
import { cmsService } from '../services/cms.service.js';
import { success } from '../utils/apiResponse.js';
import { asyncHandler } from './auth.controller.js';

export const getArtist = asyncHandler(async (req, res) => {
  const artist = await cmsService.getOrCreateSingleton(Artist);
  return success(res, { data: artist });
});

export const updateArtist = asyncHandler(async (req, res) => {
  let artist = await Artist.findOne();
  if (!artist) {
    artist = new Artist(req.body);
  } else {
    Object.assign(artist, req.body);
  }
  await artist.save();
  return success(res, { data: artist });
});

