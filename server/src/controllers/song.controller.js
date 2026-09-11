import { Song } from '../models/Song.js';
import { cmsService } from '../services/cms.service.js';
import { success } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from './auth.controller.js';

export const getSongs = asyncHandler(async (req, res) => {
  const songs = await Song.find().sort({ order: 1 });
  return success(res, { data: songs });
});

export const createSong = asyncHandler(async (req, res) => {
  const song = await Song.create(req.body);
  return success(res, { statusCode: 201, data: song });
});

export const updateSong = asyncHandler(async (req, res) => {
  const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!song) throw new AppError('Song not found', 404);
  return success(res, { data: song });
});

export const deleteSong = asyncHandler(async (req, res) => {
  const song = await Song.findByIdAndDelete(req.params.id);
  if (!song) throw new AppError('Song not found', 404);
  return success(res, { message: 'Song deleted successfully' });
});

export const reorderSongs = asyncHandler(async (req, res) => {
  await cmsService.reorderItems(Song, req.body.items);
  return success(res, { message: 'Songs reordered successfully' });
});

