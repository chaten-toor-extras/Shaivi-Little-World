import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';

const ALLOWED_FOLDERS = ['artist', 'artworks', 'journey', 'song-covers', 'audio'];

export const mediaService = {
  generateSignature(folder, resourceType = 'image') {
    if (!ALLOWED_FOLDERS.includes(folder)) {
      throw new AppError('Invalid folder', 400);
    }

    const timestamp = Math.round((new Date).getTime() / 1000);
    const params = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      cloudinary.config().api_secret
    );

    return {
      timestamp,
      signature,
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key,
      folder,
      resourceType
    };
  },

  async deleteAsset(publicId, resourceType = 'image') {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
      throw new AppError('Failed to delete asset from Cloudinary', 500);
    }
  },

  ALLOWED_FOLDERS
};

