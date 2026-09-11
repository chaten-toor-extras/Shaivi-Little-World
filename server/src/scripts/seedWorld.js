import 'dotenv/config';
import mongoose from 'mongoose';
import { WorldSettings } from '../models/WorldSettings.js';
import { defaultWorldSettings } from '../seeds/defaultWorldSettings.js';

async function seedWorld() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI missing in env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const count = await WorldSettings.countDocuments();
    if (count === 0) {
      await WorldSettings.create(defaultWorldSettings);
      console.log('✅ Seeded WorldSettings singleton with default scene values');
    } else {
      console.log('ℹ️ WorldSettings singleton already exists. Skipping.');
    }
  } catch (error) {
    console.error('❌ Error seeding WorldSettings:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedWorld();

