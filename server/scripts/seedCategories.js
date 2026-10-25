const mongoose = require('mongoose');
const dotenv = require('dotenv');
const EquipmentCategory = require('../src/models/EquipmentCategory');
const SubscriptionPlan = require('../src/models/SubscriptionPlan');

dotenv.config();

const defaultCategories = [
  {
    name: 'JCB & Excavators',
    slug: 'jcb-excavators',
    description: 'Backhoe loaders, mini excavators, and crawler excavators for earthmoving and digging.',
    iconName: 'Shovel',
    imageUrl: '/images/illustrations/jcb-excavator.svg',
  },
  {
    name: 'Cranes & Lifting',
    slug: 'cranes-lifting',
    description: 'Hydraulic mobile cranes, tower cranes, and aerial lift boom trucks.',
    iconName: 'Maximize2',
    imageUrl: '/images/illustrations/crane.svg',
  },
  {
    name: 'Generators & Power',
    slug: 'generators-power',
    description: 'Diesel silent generator sets (15 kVA to 500+ kVA) for construction and event power.',
    iconName: 'Zap',
    imageUrl: '/images/illustrations/generator.svg',
  },
  {
    name: 'Tractors & Farm Machinery',
    slug: 'tractors-farm',
    description: 'Heavy duty tractors, rotavators, and agricultural earth preparation equipment.',
    iconName: 'Truck',
    imageUrl: '/images/illustrations/tractor.svg',
  },
  {
    name: 'Concrete Mixers',
    slug: 'concrete-mixers',
    description: 'Transit mixers, portable batching mixers, and concrete vibrators.',
    iconName: 'RotateCw',
    imageUrl: '/images/illustrations/concrete-mixer.svg',
  },
  {
    name: 'Forklifts & Material Handling',
    slug: 'forklifts-handling',
    description: 'Diesel, LPG, and electric forklifts, pallet trucks, and reach stackers.',
    iconName: 'Boxes',
    imageUrl: '/images/illustrations/forklift.svg',
  },
  {
    name: 'Construction Tools & Compaction',
    slug: 'tools-compaction',
    description: 'Plate compactors, road rollers, jackhammers, and dewatering pumps.',
    iconName: 'Wrench',
    imageUrl: '/images/illustrations/road-roller.svg',
  },
  {
    name: 'Dump Trucks & Haulage',
    slug: 'dump-trucks',
    description: 'Tipper dump trucks and multi-axle heavy trailers for material transport.',
    iconName: 'Container',
    imageUrl: '/images/illustrations/dump-truck.svg',
  },
];

const defaultPlans = [
  {
    name: 'Basic Plan',
    code: 'basic',
    description: 'Ideal for independent contractors starting with a small fleet.',
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
      'Featured placement on homepage radar',
      'Instant WhatsApp booking notifications',
      'Multi-manager user permissions',
      'Custom billing invoices with GSTIN',
      '24/7 dedicated account manager',
    ],
    isActive: true,
  },
  {
    name: 'Lifetime Unlimited VIP',
    code: 'lifetime',
    description: 'One-time VIP investment for lifetime unlimited listings with zero monthly renewals.',
    price: 999900, // ₹9,999 in paise (One-time payment)
    billingInterval: 'lifetime',
    listingLimit: 9999,
    features: [
      'Unlimited equipment listings forever (no renewals)',
      'Golden VIP verified fleet badge on all machines',
      'Top-tier priority in 2dsphere GPS search radar',
      'Zero platform commission on direct rentals',
      'Full telematics & GPS real-time fleet radar tracking',
      'Instant GST compliance & automated tax invoices',
      'VIP concierge phone & on-site partner support',
    ],
    isActive: true,
  },
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/equipment_hub';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // 1. Seed Categories
    for (const cat of defaultCategories) {
      await EquipmentCategory.findOneAndUpdate({ slug: cat.slug }, cat, {
        upsert: true,
        new: true,
      });
    }
    console.log(`[Seed] Successfully seeded ${defaultCategories.length} equipment categories.`);

    // 2. Seed Subscription Plans
    for (const plan of defaultPlans) {
      await SubscriptionPlan.findOneAndUpdate({ code: plan.code }, plan, {
        upsert: true,
        new: true,
      });
    }
    console.log(`[Seed] Successfully seeded ${defaultPlans.length} subscription plans.`);

    await mongoose.disconnect();
    console.log('[Seed] Database disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
