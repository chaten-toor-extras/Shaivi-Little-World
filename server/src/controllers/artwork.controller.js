import { Artwork } from '../models/Artwork.js';
import { cmsService } from '../services/cms.service.js';
import { success } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from './auth.controller.js';

export const getArtworks = asyncHandler(async (req, res) => {
  const artworks = await Artwork.find().sort({ order: 1 });
  return success(res, { data: artworks });
});

export const createArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.create(req.body);
  return success(res, { statusCode: 201, data: artwork });
});

export const updateArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!artwork) throw new AppError('Artwork not found', 404);
  return success(res, { data: artwork });
});

export const deleteArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findByIdAndDelete(req.params.id);
  if (!artwork) throw new AppError('Artwork not found', 404);
  return success(res, { message: 'Artwork deleted successfully' });
});

export const reorderArtworks = asyncHandler(async (req, res) => {
  await cmsService.reorderItems(Artwork, req.body.items);
  return success(res, { message: 'Artworks reordered successfully' });
});

