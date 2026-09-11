import { mediaService } from '../services/media.service.js';
import { success } from '../utils/apiResponse.js';
import { asyncHandler } from './auth.controller.js';

export const getUploadSignature = asyncHandler(async (req, res) => {
  const { folder, resourceType } = req.body;
  const signatureData = mediaService.generateSignature(folder, resourceType);
  return success(res, { data: signatureData });
});

