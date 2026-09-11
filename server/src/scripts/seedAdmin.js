import bcrypt from 'bcryptjs';
import 'dotenv/config';
import mongoose from 'mongoose';
import { Admin } from '../models/Admin.js';

async function seedAdmin() {
  try {
    const uri = process.env.MONGODB_URI;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!uri || !email || !password) {
      console.error('❌ MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD must be defined in env.');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const normalizedEmail = email.toLowerCase();
    const existing = await Admin.findOne({ email: normalizedEmail });

    const isForce = process.argv.includes('--force');

    if (existing && !isForce) {
      console.log('ℹ️ Admin already exists. Use --force to reset password.');
    } else {
      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '10', 10));

      if (existing) {
        existing.passwordHash = passwordHash;
        await existing.save();
        console.log('✅ Admin password reset successfully.');
      } else {
        await Admin.create({ email: normalizedEmail, passwordHash });
        console.log('✅ Admin created successfully.');
      }
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedAdmin();

