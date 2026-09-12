import 'dotenv/config';
import mongoose from 'mongoose';
import { Collectible } from '../models/Collectible.js';
import { Secret } from '../models/Secret.js';
import { defaultCollectibles } from '../seeds/defaultCollectibles.js';

export async function seedCollectibles() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI missing in env');
      return;
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB for collectibles seeding');
    }

    let createdCount = 0;
    for (const col of defaultCollectibles) {
      const existing = await Collectible.findOne({ slug: col.slug });
      if (!existing) {
        await Collectible.create(col);
        createdCount++;
        console.log(`✅ Seeded collectible: ${col.name} (${col.slug})`);
      } else {
        console.log(`ℹ️ Collectible already exists: ${col.slug}. Skipping.`);
      }
    }

    // Link Butterfly Whisper secret to Golden Wing collectible
    const goldenWing = await Collectible.findOne({ slug: 'golden-wing' });
    if (goldenWing) {
      const butterflySecret = await Secret.findOne({ slug: 'butterfly-whisper' });
      if (butterflySecret && (!butterflySecret.reveal?.collectibleId || butterflySecret.reveal?.type !== 'COLLECTIBLE')) {
        butterflySecret.reveal = {
          ...butterflySecret.reveal,
          type: 'COLLECTIBLE',
          collectibleId: goldenWing._id,
        };
        await butterflySecret.save();
        console.log('🔗 Linked Butterfly Whisper secret to Golden Wing collectible reward');
      }
    }

    console.log(`✨ Successfully seeded ${createdCount} collectibles!`);
  } catch (error) {
    console.error('❌ Error seeding collectibles:', error);
  }
}

// Standalone execution
if (process.argv[1]?.endsWith('seedCollectibles.js')) {
  seedCollectibles().then(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}

