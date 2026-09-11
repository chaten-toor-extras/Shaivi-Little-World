import 'dotenv/config';
import mongoose from 'mongoose';
import { JourneyMilestone } from '../models/JourneyMilestone.js';

const defaultJourneyMilestones = [
  {
    title: "First Sketches",
    year: "2022",
    text: "An imagined beginning: a pencil, a blank page, and a growing collection of little observations.",
    image: {
      url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
      src: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
      alt: "First Sketches",
    },
    altText: "First Sketches",
    order: 0,
    isPublished: true,
    desktopPosition: { x: 14, y: 58 },
    telescope: {
      enabled: true,
      x: 14,
      y: 58,
      depth: 0.3,
      size: "featured",
      glowColor: "#c4b5fd",
      constellationOrder: 0,
    },
  },
  {
    title: "Experiments",
    year: "2023",
    text: "Trying unfamiliar colours and finding the unexpected in happy accidents.",
    image: {
      url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80",
      src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80",
      alt: "Experiments",
    },
    altText: "Experiments",
    order: 1,
    isPublished: true,
    desktopPosition: { x: 32, y: 32 },
    telescope: {
      enabled: true,
      x: 32,
      y: 32,
      depth: 0.5,
      size: "normal",
      glowColor: "#93c5fd",
      constellationOrder: 1,
    },
  },
  {
    title: "Digital Art",
    year: "2024",
    text: "Taking the same curiosity into a new medium. Learning to make room for play.",
    image: {
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      alt: "Digital Art",
    },
    altText: "Digital Art",
    order: 2,
    isPublished: true,
    desktopPosition: { x: 50, y: 64 },
    telescope: {
      enabled: true,
      x: 50,
      y: 64,
      depth: 0.4,
      size: "featured",
      glowColor: "#fde047",
      constellationOrder: 2,
    },
  },
  {
    title: "Visual Stories",
    year: "2025",
    text: "Connecting individual ideas into small narratives, one image at a time.",
    image: {
      url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
      src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
      alt: "Visual Stories",
    },
    altText: "Visual Stories",
    order: 3,
    isPublished: true,
    desktopPosition: { x: 68, y: 28 },
    telescope: {
      enabled: true,
      x: 68,
      y: 28,
      depth: 0.6,
      size: "normal",
      glowColor: "#f472b6",
      constellationOrder: 3,
    },
  },
  {
    title: "Exploring Now",
    year: "2026",
    text: "Still collecting, still noticing. The next constellation has yet to take shape.",
    image: {
      url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
      src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
      alt: "Exploring Now",
    },
    altText: "Exploring Now",
    order: 4,
    isPublished: true,
    desktopPosition: { x: 86, y: 48 },
    telescope: {
      enabled: true,
      x: 86,
      y: 48,
      depth: 0.3,
      size: "featured",
      glowColor: "#a7f3d0",
      constellationOrder: 4,
    },
  },
];

async function seedJourney() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI missing in env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing milestones to cleanly reset
    const deleted = await JourneyMilestone.deleteMany({});
    console.log(`🗑️ Removed ${deleted.deletedCount} old milestones.`);

    // Insert rich default journey milestones
    const created = await JourneyMilestone.insertMany(defaultJourneyMilestones);
    console.log(`✨ Successfully seeded ${created.length} default journey milestones!`);

    created.forEach((m, i) => {
      console.log(`   [${i + 1}] ${m.year} · ${m.title} (x: ${m.telescope?.x}, y: ${m.telescope?.y})`);
    });
  } catch (error) {
    console.error('❌ Error seeding journey:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedJourney();

