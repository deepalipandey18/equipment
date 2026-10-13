const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/equipment_hub';
    await mongoose.connect(mongoUri);
    console.log('[Seed Admin] Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@equipmenthub.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Platform Administrator';
    const adminPhone = process.env.ADMIN_PHONE || '+919876543210';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.accountStatus = 'active';
      existingAdmin.verificationStatus = 'verified';
      await existingAdmin.save();
      console.log(`[Seed Admin] Admin account already exists for ${adminEmail}. Role updated to 'admin'.`);
    } else {
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        passwordHash: adminPassword,
        role: 'admin',
        accountStatus: 'active',
        verificationStatus: 'verified',
      });
      console.log(`[Seed Admin] Initial Administrator created successfully: ${admin.email}`);
    }

    await mongoose.disconnect();
    console.log('[Seed Admin] Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Admin Error]:', error);
    process.exit(1);
  }
};

seedAdmin();

