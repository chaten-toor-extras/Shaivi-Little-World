import { worldSettingsService } from '../services/worldSettings.service.js';
import { success } from '../utils/apiResponse.js';
import { asyncHandler } from './auth.controller.js';

export const getWorldSettings = asyncHandler(async (req, res) => {
  const settings = await worldSettingsService.getWorldSettings();
  return success(res, { data: settings });
});

export const updateWorldSettings = asyncHandler(async (req, res) => {
  const settings = await worldSettingsService.updateWorldSettings(req.body);
  return success(res, {
    message: 'World settings updated successfully',
    data: settings,
  });
});

export const resetWorldSettings = asyncHandler(async (req, res) => {
  const { section } = req.params;
  const settings = await worldSettingsService.resetWorldSettings(section);
  return success(res, {
    message: section
      ? `World settings for section "${section}" reset to default`
      : 'All world settings reset to default',
    data: settings,
  });
});

