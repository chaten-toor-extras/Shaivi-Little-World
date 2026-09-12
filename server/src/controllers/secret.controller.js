import { Secret } from '../models/Secret.js';
import { cmsService } from '../services/cms.service.js';
import { secretService } from '../services/secret.service.js';
import { success } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from './auth.controller.js';

export const getSecrets = asyncHandler(async (req, res) => {
  const secrets = await Secret.find().sort({ order: 1 });
  return success(res, { data: secrets });
});

export const createSecret = asyncHandler(async (req, res) => {
  const { conditions } = req.body;
  if (conditions?.requiresSecretIds?.length) {
    await secretService.validateNoCircularDependencies(null, conditions.requiresSecretIds);
  }

  // Count to set default order
  const count = await Secret.countDocuments();
  const secretData = {
    ...req.body,
    order: req.body.order !== undefined ? req.body.order : count,
  };

  const secret = await Secret.create(secretData);
  return success(res, { statusCode: 201, data: secret });
});

export const updateSecret = asyncHandler(async (req, res) => {
  const existing = await Secret.findById(req.params.id);
  if (!existing) throw new AppError('Secret not found', 404);

  // If slug is provided and different from existing slug, reject or preserve immutable slug
  if (req.body.slug && req.body.slug !== existing.slug) {
    throw new AppError('Secret slug is immutable after creation', 400);
  }

  const { conditions } = req.body;
  if (conditions?.requiresSecretIds) {
    await secretService.validateNoCircularDependencies(req.params.id, conditions.requiresSecretIds);
  }

  // Prevent modifying slug
  const { slug, ...updateData } = req.body;

  const secret = await Secret.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  return success(res, { data: secret });
});

export const deleteSecret = asyncHandler(async (req, res) => {
  const secret = await Secret.findByIdAndDelete(req.params.id);
  if (!secret) throw new AppError('Secret not found', 404);

  // Clean up any references in other secrets' requiresSecretIds
  await Secret.updateMany(
    { 'conditions.requiresSecretIds': req.params.id },
    { $pull: { 'conditions.requiresSecretIds': req.params.id } }
  );

  return success(res, { message: 'Secret deleted successfully' });
});

export const duplicateSecret = asyncHandler(async (req, res) => {
  const newSecret = await secretService.duplicateSecret(req.params.id);
  return success(res, { statusCode: 201, data: newSecret });
});

export const reorderSecrets = asyncHandler(async (req, res) => {
  await cmsService.reorderItems(Secret, req.body.items);
  return success(res, { message: 'Secrets reordered successfully' });
});

