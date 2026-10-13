const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SubscriptionPlan = require('../src/models/SubscriptionPlan');

dotenv.config();

const defaultPlans = [
  {
    name: 'Basic Plan',
    code: 'basic',
    description: 'Ideal for independent contractors starting with a small machinery fleet.',
    price: 49900, // ₹499 in paise
    billingInterval: 'monthly',
    listingLimit: 2,
    features: [
      'Up to 2 active equipment listings',
      'Standard search placement',
      'Direct customer booking requests',
      'Online payment verification',
      'Basic listing analytics',
    ],
    isActive: true,
  },
  {
    name: 'Pro Plan',
    code: 'pro',
    description: 'Perfect for rental businesses managing multiple machines across regions.',
    price: 99900, // ₹999 in paise
    billingInterval: 'monthly',
    listingLimit: 10,
    features: [
      'Up to 10 active equipment listings',
      'Priority badge & top search placement',
      'Instant booking request alerts',
      'Advanced availability blackout calendar',
      'Dedicated partner support',
    ],
    isActive: true,
  },
  {
    name: 'Business Fleet',
    code: 'business',
    description: 'Enterprise tier for fleet owners and contractors with large inventories.',
    price: 249900, // ₹2,499 in paise
    billingInterval: 'monthly',
    listingLimit: 50,
    features: [
      'Up to 50 active equipment listings',
      'Featured homepage banner rotation',
      'Multi-city and multi-depot management',
      'Custom invoice branding & automated receipts',
      '24/7 Priority phone support & account manager',
    ],
    isActive: true,
  },
];

async function seedPlans() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/equipment_hub';
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding subscription plans...');

    for (const planData of defaultPlans) {
      await SubscriptionPlan.findOneAndUpdate(
        { code: planData.code },
        planData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const count = await SubscriptionPlan.countDocuments();
    console.log(`Successfully seeded/verified ${count} subscription plans!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding subscription plans:', err);
    process.exit(1);
  }
}

seedPlans();

