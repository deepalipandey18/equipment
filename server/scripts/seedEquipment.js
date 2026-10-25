const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Equipment = require('../src/models/Equipment');
const EquipmentCategory = require('../src/models/EquipmentCategory');
const User = require('../src/models/User');

dotenv.config();

const sampleEquipment = [
  {
    name: 'JCB 3DX Super Backhoe Loader',
    categorySlug: 'jcb-excavators',
    brand: 'JCB',
    model: '3DX Super EcoMax',
    year: 2022,
    description: 'High performance backhoe loader with heavy duty bucket and standard breaker piping. Ideal for digging trenches, basement excavations, and material loading. Fuel-efficient EcoMax engine with certified experienced operator.',
    condition: 'excellent',
    photos: ['/images/illustrations/jcb-excavator.svg'],
    hourlyRate: 1100,
    dailyRate: 8500,
    monthlyRate: 195000,
    securityDeposit: 20000,
    deliveryCharges: 3500,
    operatorOption: 'included',
    location: {
      type: 'Point',
      coordinates: [77.0878, 28.4595], // Gurugram
    },
    address: {
      street: 'Plot 42, Sector 37 Industrial Area',
      area: 'Pace City I',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
    },
    deliveryRadiusKm: 60,
    approvalStatus: 'approved',
    listingStatus: 'active',
  },
  {
    name: 'Caterpillar 320D2 Hydraulic Crawler Excavator',
    categorySlug: 'jcb-excavators',
    brand: 'Caterpillar',
    model: '320D2 GC',
    year: 2021,
    description: '20-ton class heavy crawler excavator for bulk earthmoving, rock breaking, and deep canal works. Regular dealer maintenance, 1.0 cu.m heavy bucket, air-conditioned cabin.',
    condition: 'excellent',
    photos: ['/images/illustrations/jcb-excavator.svg'],
    hourlyRate: 1800,
    dailyRate: 14000,
    monthlyRate: 320000,
    securityDeposit: 35000,
    deliveryCharges: 6000,
    operatorOption: 'included',
    location: {
      type: 'Point',
      coordinates: [77.391, 28.5355], // Noida
    },
    address: {
      street: 'C-Block, Phase 2 Hosiery Complex',
      area: 'Sector 81',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201305',
    },
    deliveryRadiusKm: 80,
    approvalStatus: 'approved',
    listingStatus: 'active',
  },
  {
    name: 'ACE 25X Mobile Telescopic Crane',
    categorySlug: 'cranes-lifting',
    brand: 'ACE',
    model: '25X Mobile',
    year: 2022,
    description: '25-ton hydraulic telescopic boom crane with 34.5m hook reach and 4-fall heavy wire hoist. Load chart certified with experienced licensed rigger operator.',
    condition: 'excellent',
    photos: ['/images/illustrations/crane.svg'],
    hourlyRate: 1900,
    dailyRate: 14500,
    monthlyRate: 340000,
    securityDeposit: 30000,
    deliveryCharges: 5000,
    operatorOption: 'included',
    location: {
      type: 'Point',
      coordinates: [77.3178, 28.4089], // Faridabad
    },
    address: {
      street: 'Sector 24 Heavy Industrial Area',
      area: 'Mathura Road Corridor',
      city: 'Faridabad',
      state: 'Haryana',
      pincode: '121005',
    },
    deliveryRadiusKm: 75,
    approvalStatus: 'approved',
    listingStatus: 'active',
  },
  {
    name: 'BharatBenz 3528C Heavy Tipper Dump Truck',
    categorySlug: 'dump-trucks',
    brand: 'BharatBenz',
    model: '3528C Mining',
    year: 2023,
    description: '28-ton multi-axle heavy duty tipper truck for bulk quarry, sand, aggregate, and demolition debris hauling. Certified heavy driver included.',
    condition: 'excellent',
    photos: ['/images/illustrations/dump-truck.svg'],
    hourlyRate: 1200,
    dailyRate: 9200,
    monthlyRate: 210000,
    securityDeposit: 25000,
    deliveryCharges: 3000,
    operatorOption: 'included',
    location: {
      type: 'Point',
      coordinates: [77.0362, 28.4316], // Sohna Road Gurugram
    },
    address: {
      street: 'Badshahpur Highway Crossing',
      area: 'Sector 66',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122101',
    },
    deliveryRadiusKm: 90,
    approvalStatus: 'approved',
    listingStatus: 'active',
  },
  {
    name: 'Kirloskar 125 kVA Silent Diesel Generator Set',
    categorySlug: 'generators-power',
    brand: 'Kirloskar',
    model: 'KG125WS',
    year: 2023,
    description: 'Soundproof CPCB-II compliant silent diesel DG set mounted on a robust base. Continuous prime power for construction sites, ready mix plants, and high-load installations. Low diesel consumption.',
    condition: 'excellent',
    photos: ['/images/illustrations/generator.svg'],
    hourlyRate: 600,
    dailyRate: 4200,
    monthlyRate: 85000,
    securityDeposit: 15000,
    deliveryCharges: 2500,
    operatorOption: 'optional',
    location: {
      type: 'Point',
      coordinates: [77.209, 28.5355], // South Delhi / Saket
    },
    address: {
      street: 'Mandir Marg, Saidulajab',
      area: 'Saket Metro Depot',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110030',
    },
    deliveryRadiusKm: 50,
    approvalStatus: 'approved',
    listingStatus: 'active',
  },
  {
    name: 'Mahindra 575 DI 45 HP Heavy Farm Tractor with Trolley',
    categorySlug: 'tractors-farm',
    brand: 'Mahindra',
    model: '575 DI Sarpanch',
    year: 2020,
    description: '45 HP rugged multi-purpose tractor equipped with heavy-duty hydraulic tipping trailer/trolley. Ideal for site debris shifting, sand transport, leveling, and rural agricultural hauling.',
    condition: 'good',
    photos: ['/images/illustrations/tractor.svg'],
    hourlyRate: 450,
    dailyRate: 3200,
    monthlyRate: 70000,
    securityDeposit: 10000,
    deliveryCharges: 1500,
    operatorOption: 'optional',
    location: {
      type: 'Point',
      coordinates: [77.3178, 28.4089], // Faridabad
    },
    address: {
      street: 'Mathura Road, Sector 6',
      area: 'Industrial Area',
      city: 'Faridabad',
      state: 'Haryana',
      pincode: '121006',
    },
    deliveryRadiusKm: 45,
    approvalStatus: 'approved',
    listingStatus: 'active',
  },
  {
    name: 'Schwing Stetter 6 Cu.M Transit Concrete Mixer',
    categorySlug: 'concrete-mixers',
    brand: 'Schwing Stetter',
    model: 'AM 6 FHC',
    year: 2022,
    description: '6 cubic meter transit concrete mixer mounted on Ashok Leyland Captain chassis. Optimized spiral blade drum ensuring homogenous concrete consistency without segregation. Slave engine driven.',
    condition: 'excellent',
    photos: ['/images/illustrations/concrete-mixer.svg'],
    hourlyRate: 1400,
    dailyRate: 9800,
    monthlyRate: 230000,
    securityDeposit: 25000,
    deliveryCharges: 4000,
    operatorOption: 'included',
    location: {
      type: 'Point',
      coordinates: [77.4538, 28.6692], // Ghaziabad
    },
    address: {
      street: 'Meerut Road Industrial Area',
      area: 'Loni Border Link',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201003',
    },
    deliveryRadiusKm: 70,
    approvalStatus: 'approved',
    listingStatus: 'active',
  },
  {
    name: 'Toyota 3-Ton Diesel Rough Terrain Forklift',
    categorySlug: 'forklifts-handling',
    brand: 'Toyota',
    model: '8FD30',
    year: 2021,
    description: '3,000 kg capacity industrial counterbalanced forklift with pneumatic tires and 4.5m duplex mast with side shifter. Excellent for heavy precast blocks, steel pallet loading, and warehouse staging.',
    condition: 'good',
    photos: ['/images/illustrations/forklift.svg'],
    hourlyRate: 500,
    dailyRate: 3500,
    monthlyRate: 75000,
    securityDeposit: 12000,
    deliveryCharges: 2000,
    operatorOption: 'optional',
    location: {
      type: 'Point',
      coordinates: [76.9328, 28.3516], // Manesar
    },
    address: {
      street: 'Sector 8, IMT Manesar',
      area: 'Industrial Model Township',
      city: 'Manesar',
      state: 'Haryana',
      pincode: '122051',
    },
    deliveryRadiusKm: 50,
    approvalStatus: 'approved',
    listingStatus: 'active',
  },
  {
    name: 'L&T 1190 Heavy Soil Compactor Road Roller',
    categorySlug: 'tools-compaction',
    brand: 'L&T',
    model: '1190 Vibratory',
    year: 2022,
    description: '11-ton heavy vibratory soil compactor and asphalt road roller with smooth steel drum. Excellent high-amplitude compaction for road sub-base and foundation preparation.',
    condition: 'excellent',
    photos: ['/images/illustrations/road-roller.svg'],
    hourlyRate: 1100,
    dailyRate: 7800,
    monthlyRate: 175000,
    securityDeposit: 20000,
    deliveryCharges: 3500,
    operatorOption: 'included',
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041], // North Delhi
    },
    address: {
      street: 'GT Karnal Road Industrial Zone',
      area: 'Alipur Bypass',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110036',
    },
    deliveryRadiusKm: 65,
    approvalStatus: 'approved',
    listingStatus: 'active',
  },
];

const seedEquipment = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/equipment_hub';
    await mongoose.connect(mongoUri);
    console.log('[Seed Equipment] Connected to MongoDB');

    // Find or create an owner user
    let owner = await User.findOne({ email: 'admin@equipmenthub.com' });
    if (!owner) {
      owner = await User.findOne();
    }
    if (!owner) {
      console.error('[Seed Equipment] Please run seedAdmin first to create a default user.');
      process.exit(1);
    }

    const categories = await EquipmentCategory.find();
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    for (const item of sampleEquipment) {
      const categoryId = catMap[item.categorySlug] || categories[0]._id;
      const { categorySlug, ...data } = item;

      await Equipment.findOneAndUpdate(
        { name: item.name },
        {
          ...data,
          ownerId: owner._id,
          categoryId,
        },
        { upsert: true, new: true }
      );
    }

    console.log(`[Seed Equipment] Successfully seeded ${sampleEquipment.length} sample heavy machines with 3D cartoon illustrations and 2dsphere coordinates.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Equipment Error]:', error);
    process.exit(1);
  }
};

seedEquipment();
