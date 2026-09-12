import { Collectible } from '../models/Collectible.js';
import { collectibleService } from '../services/collectible.service.js';
import { cmsService } from '../services/cms.service.js';
import { success } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from './auth.controller.js';

export const getCollectibles = asyncHandler(async (req, res) => {
  const collectibles = await Collectible.find().sort({ order: 1 });
  return success(res, { data: collectibles });
});

export const createCollectible = asyncHandler(async (req, res) => {
  // Count to set default order
  const count = await Collectible.countDocuments();
  const collectibleData = {
    ...req.body,
    order: req.body.order !== undefined ? req.body.order : count,
  };

  const collectible = await Collectible.create(collectibleData);
  return success(res, { statusCode: 201, data: collectible });
});

export const updateCollectible = asyncHandler(async (req, res) => {
  const existing = await Collectible.findById(req.params.id);
  if (!existing) throw new AppError('Collectible not found', 404);

  // If slug is provided and different from existing slug, reject immutable slug
  if (req.body.slug && req.body.slug !== existing.slug) {
    throw new AppError('Collectible slug is immutable after creation', 400);
  }

  // Prevent modifying slug
  const { slug, ...updateData } = req.body;

  const collectible = await Collectible.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  return success(res, { data: collectible });
});

export const deleteCollectible = asyncHandler(async (req, res) => {
  const collectible = await Collectible.findByIdAndDelete(req.params.id);
  if (!collectible) throw new AppError('Collectible not found', 404);

  // Clean up any references in Secrets
  await collectibleService.cleanupSecretReferences(req.params.id);

  return success(res, { message: 'Collectible deleted successfully' });
});

export const reorderCollectibles = asyncHandler(async (req, res) => {
  await cmsService.reorderItems(Collectible, req.body.items);
  return success(res, { message: 'Collectibles reordered successfully' });
});

