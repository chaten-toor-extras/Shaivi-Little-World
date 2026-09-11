import { error } from '../utils/apiResponse.js';

export const notFoundHandler = (req, res) => {
  return error(res, { statusCode: 404, message: `Route ${req.originalUrl} not found` });
};

