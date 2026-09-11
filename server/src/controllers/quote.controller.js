import { Quote } from '../models/Quote.js';
import { cmsService } from '../services/cms.service.js';
import { success } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from './auth.controller.js';

export const getQuotes = asyncHandler(async (req, res) => {
  const quotes = await Quote.find().sort({ order: 1 });
  return success(res, { data: quotes });
});

export const createQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.create(req.body);
  return success(res, { statusCode: 201, data: quote });
});

export const updateQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!quote) throw new AppError('Quote not found', 404);
  return success(res, { data: quote });
});

export const deleteQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findByIdAndDelete(req.params.id);
  if (!quote) throw new AppError('Quote not found', 404);
  return success(res, { message: 'Quote deleted successfully' });
});

export const reorderQuotes = asyncHandler(async (req, res) => {
  await cmsService.reorderItems(Quote, req.body.items);
  return success(res, { message: 'Quotes reordered successfully' });
});

