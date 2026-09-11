import { JourneyMilestone } from '../models/JourneyMilestone.js';
import { cmsService } from '../services/cms.service.js';
import { success } from '../utils/apiResponse.js';
import { asyncHandler } from './auth.controller.js';
import { AppError } from '../utils/AppError.js';

export const getMilestones = asyncHandler(async (req, res) => {
  const milestones = await JourneyMilestone.find().sort({ order: 1 });
  return success(res, { data: milestones });
});

export const createMilestone = asyncHandler(async (req, res) => {
  const milestone = await JourneyMilestone.create(req.body);
  return success(res, { statusCode: 201, data: milestone });
});

export const updateMilestone = asyncHandler(async (req, res) => {
  const milestone = await JourneyMilestone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!milestone) throw new AppError('Milestone not found', 404);
  return success(res, { data: milestone });
});

export const deleteMilestone = asyncHandler(async (req, res) => {
  const milestone = await JourneyMilestone.findByIdAndDelete(req.params.id);
  if (!milestone) throw new AppError('Milestone not found', 404);
  return success(res, { message: 'Milestone deleted successfully' });
});

export const reorderMilestones = asyncHandler(async (req, res) => {
  await cmsService.reorderItems(JourneyMilestone, req.body.items);
  return success(res, { message: 'Milestones reordered successfully' });
});

