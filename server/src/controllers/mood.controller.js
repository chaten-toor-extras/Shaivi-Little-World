import { Mood } from '../models/Mood.js';
import { success } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from './auth.controller.js';

export const getMoods = asyncHandler(async (req, res) => {
  const moods = await Mood.find().sort({ order: 1 });
  return success(res, { data: moods });
});

export const createMood = asyncHandler(async (req, res) => {
  const mood = await Mood.create(req.body);
  return success(res, { statusCode: 201, data: mood });
});

export const updateMood = asyncHandler(async (req, res) => {
  const mood = await Mood.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!mood) throw new AppError('Mood not found', 404);
  return success(res, { data: mood });
});

export const deleteMood = asyncHandler(async (req, res) => {
  const mood = await Mood.findByIdAndDelete(req.params.id);
  if (!mood) throw new AppError('Mood not found', 404);
  return success(res, { message: 'Mood deleted successfully' });
});

