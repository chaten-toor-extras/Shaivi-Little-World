import { AppError } from '../utils/AppError.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      const formattedErrors = error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message
      }));
      next(new AppError('Validation Error', 422, formattedErrors));
    }
  };
};

