import { ContactSettings } from '../models/ContactSettings.js';
import { cmsService } from '../services/cms.service.js';
import { success } from '../utils/apiResponse.js';
import { asyncHandler } from './auth.controller.js';

export const getContactSettings = asyncHandler(async (req, res) => {
  const settings = await cmsService.getOrCreateSingleton(ContactSettings);
  return success(res, { data: settings });
});

export const updateContactSettings = asyncHandler(async (req, res) => {
  let settings = await ContactSettings.findOne();
  if (!settings) {
    settings = new ContactSettings(req.body);
  } else {
    Object.assign(settings, req.body);
  }
  await settings.save();
  return success(res, { data: settings });
});

