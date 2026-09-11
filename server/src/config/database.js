import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { env } from './env.js';

export const connectDatabase = async () => {
  try {
    mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
    mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB connection error'));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

    await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    logger.fatal({ error }, 'Failed to connect to MongoDB');
    process.exit(1);
  }
};

