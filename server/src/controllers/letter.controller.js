import { Letter } from '../models/Letter.js';
import { success } from '../utils/apiResponse.js';
import { asyncHandler } from './auth.controller.js';
import { AppError } from '../utils/AppError.js';
import { parsePagination } from '../utils/pagination.js';

export const getLetters = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { email: new RegExp(req.query.search, 'i') },
      { message: new RegExp(req.query.search, 'i') }
    ];
  }

  const [letters, total] = await Promise.all([
    Letter.find(filter).sort(sort).skip(skip).limit(limit),
    Letter.countDocuments(filter)
  ]);

  return success(res, {
    data: letters,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getLetter = asyncHandler(async (req, res) => {
  const letter = await Letter.findById(req.params.id);
  if (!letter) throw new AppError('Letter not found', 404);

  if (letter.status === 'unread') {
    letter.status = 'read';
    await letter.save();
  }

  return success(res, { data: letter });
});

export const updateLetterStatus = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const update = { status };
  if (adminNote !== undefined) update.adminNote = adminNote;

  const letter = await Letter.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!letter) throw new AppError('Letter not found', 404);

  return success(res, { data: letter });
});

export const deleteLetter = asyncHandler(async (req, res) => {
  const letter = await Letter.findByIdAndDelete(req.params.id);
  if (!letter) throw new AppError('Letter not found', 404);
  return success(res, { message: 'Letter deleted successfully' });
});

// For public API
export const createLetter = asyncHandler(async (req, res) => {
  const letter = await Letter.create(req.body);
  return success(res, { statusCode: 201, message: 'Message sent successfully', data: { id: letter._id } });
});

