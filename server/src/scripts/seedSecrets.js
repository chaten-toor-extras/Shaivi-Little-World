import 'dotenv/config';
import mongoose from 'mongoose';
import { Secret } from '../models/Secret.js';
import { defaultSecrets } from '../seeds/defaultSecrets.js';

async function seedSecrets() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI missing in env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let createdCount = 0;
    for (const sec of defaultSecrets) {
      const existing = await Secret.findOne({ slug: sec.slug });
      if (!existing) {
        await Secret.create(sec);
        createdCount++;
        console.log(`✅ Seeded secret: ${sec.name} (${sec.slug})`);
      } else {
        console.log(`ℹ️ Secret already exists: ${sec.slug}. Skipping.`);
      }
    }

    console.log(`✨ Successfully seeded ${createdCount} secrets!`);
  } catch (error) {
    console.error('❌ Error seeding secrets:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedSecrets();

