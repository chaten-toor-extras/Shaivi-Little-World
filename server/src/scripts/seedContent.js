import 'dotenv/config';
import mongoose from 'mongoose';
import { Artist } from '../models/Artist.js';
import { Artwork } from '../models/Artwork.js';
import { ContactSettings } from '../models/ContactSettings.js';
import { JourneyMilestone } from '../models/JourneyMilestone.js';
import { Mood } from '../models/Mood.js';
import { Quote } from '../models/Quote.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { Song } from '../models/Song.js';
import { WorldSettings } from '../models/WorldSettings.js';
import { defaultContent } from '../seeds/defaultContent.js';
import { defaultWorldSettings } from '../seeds/defaultWorldSettings.js';

async function seedContent() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI missing in env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const seedSingleton = async (Model, data, name) => {
      const count = await Model.countDocuments();
      if (count === 0) {
        await Model.create(data);
        console.log(`✅ Seeded ${name}`);
      } else {
        console.log(`ℹ️ ${name} already exists. Skipping.`);
      }
    };

    const seedCollection = async (Model, dataArray, name) => {
      const count = await Model.countDocuments();
      if (count === 0) {
        return await Model.insertMany(dataArray);
      } else {
        console.log(`ℹ️ ${name} collection not empty. Skipping.`);
        return await Model.find();
      }
    };

    await seedSingleton(SiteSettings, defaultContent.site, 'SiteSettings');
    await seedSingleton(Artist, defaultContent.artist, 'Artist');
    await seedSingleton(ContactSettings, defaultContent.contact, 'ContactSettings');
    await seedSingleton(WorldSettings, defaultWorldSettings, 'WorldSettings');

    await seedCollection(Quote, defaultContent.quotes, 'Quotes');
    await seedCollection(Artwork, defaultContent.artworks, 'Artworks');
    await seedCollection(JourneyMilestone, defaultContent.journey, 'JourneyMilestones');

    // Seed songs, then use their IDs for moods
    const songs = await seedCollection(Song, defaultContent.songs, 'Songs');

    const moodCount = await Mood.countDocuments();
    if (moodCount === 0 && songs && songs.length > 0) {
      const moodsWithSongs = defaultContent.moods.map((mood, i) => {
        // Assign a couple of songs to each mood randomly
        const assignedSongs = [songs[i % songs.length]._id];
        return { ...mood, songIds: assignedSongs };
      });
      await Mood.insertMany(moodsWithSongs);
      console.log('✅ Seeded Moods');
    } else {
      console.log('ℹ️ Moods collection not empty or no songs. Skipping.');
    }

    console.log('✨ Seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding content:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedContent();

