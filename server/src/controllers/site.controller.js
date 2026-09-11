import { SiteSettings } from '../models/SiteSettings.js';
import { cmsService } from '../services/cms.service.js';
import { success } from '../utils/apiResponse.js';
import { asyncHandler } from './auth.controller.js'; // reusing asyncHandler

export const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await cmsService.getOrCreateSingleton(SiteSettings);
  return success(res, { data: settings });
});

export const updateSiteSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = new SiteSettings(req.body);
  } else {
    Object.assign(settings, req.body);
  }
  await settings.save();
  return success(res, { data: settings });
});

