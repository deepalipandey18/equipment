const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../src/models/User');
const EquipmentCategory = require('../src/models/EquipmentCategory');
const SubscriptionPlan = require('../src/models/SubscriptionPlan');
const Subscription = require('../src/models/Subscription');
const Payment = require('../src/models/Payment');
const Equipment = require('../src/models/Equipment');
const Booking = require('../src/models/Booking');
const AuditLog = require('../src/models/AuditLog');

const categoriesData = [
  {
    name: 'JCB & Excavators',
    slug: 'jcb-excavators',
    description: 'Backhoe loaders, mini excavators, and crawler excavators for earthmoving and digging.',
    iconName: 'Shovel',
  },
  {
    name: 'Cranes & Lifting',
    slug: 'cranes-lifting',
    description: 'Hydraulic mobile cranes, tower cranes, and aerial lift boom trucks.',
    iconName: 'Maximize2',
  },
  {
    name: 'Generators & Power',
    slug: 'generators-power',
    description: 'Diesel silent generator sets (15 kVA to 500+ kVA) for construction and event power.',
    iconName: 'Zap',
  },
  {
    name: 'Tractors & Farm Machinery',
    slug: 'tractors-farm',
    description: 'Heavy duty tractors, rotavators, and agricultural earth preparation equipment.',
    iconName: 'Truck',
  },
  {
    name: 'Concrete Mixers',
    slug: 'concrete-mixers',
    description: 'Transit mixers, portable batching mixers, and concrete vibrators.',
    iconName: 'RotateCw',
  },
  {
    name: 'Forklifts & Material Handling',
    slug: 'forklifts-handling',
    description: 'Diesel, LPG, and electric forklifts, pallet trucks, and reach stackers.',
    iconName: 'Boxes',
  },
  {
    name: 'Construction Tools & Compaction',
    slug: 'tools-compaction',
    description: 'Plate compactors, road rollers, jackhammers, and dewatering pumps.',
    iconName: 'Wrench',
  },
  {
    name: 'Dump Trucks & Haulage',
    slug: 'dump-trucks',
    description: 'Tipper dump trucks and multi-axle heavy trailers for material transport.',
    iconName: 'Container',
  },
];

const plansData = [
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
  {
    name: 'Lifetime VIP Access',
    code: 'lifetime',
    description: 'One-time investment for permanent platform access. Unlimited machinery listings & VIP privileges forever.',
    price: 999900, // ₹9,999 in paise (one-time)
    billingInterval: 'lifetime',
    listingLimit: 999,
    features: [
      'Unlimited active equipment listings forever',
      'No monthly or yearly renewal fees (Pay once, own forever)',
      'Top priority VIP badge & search radar placement',
      'Zero commission on direct contractor rental inquiries',
      'Live GPS Telematics & fleet tracking included',
      'Dedicated VIP Account Manager & 24/7 priority phone line',
      'Free access to all future marketplace feature updates',
    ],
    isActive: true,
  },
];

async function seedAll(exitOnFinish = true) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/equipment_hub';
  console.log('[Seed All] Starting full database seeding...');

  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (shouldDisconnect) {
    await mongoose.connect(mongoUri);
    console.log('[Seed All] Connected to MongoDB at:', mongoUri);
  }

  try {
    // 1. Seed Categories
    console.log('[1/8] Seeding Equipment Categories...');
    const categoriesMap = {};
    for (const cat of categoriesData) {
      const savedCat = await EquipmentCategory.findOneAndUpdate(
        { slug: cat.slug },
        cat,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categoriesMap[cat.slug] = savedCat._id;
    }
    console.log(`  -> ${Object.keys(categoriesMap).length} Categories seeded.`);

    // 2. Seed Subscription Plans
    console.log('[2/8] Seeding Subscription Plans...');
    const plansMap = {};
    for (const plan of plansData) {
      const savedPlan = await SubscriptionPlan.findOneAndUpdate(
        { code: plan.code },
        plan,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      plansMap[plan.code] = savedPlan;
    }
    console.log(`  -> ${Object.keys(plansMap).length} Subscription Plans seeded.`);

    // 3. Seed Users (Admin + Dual-Role Contractor Accounts)
    console.log('[3/8] Seeding Users...');
    const usersData = [
      {
        name: 'Platform Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@equipmenthub.com',
        phone: '+919876543210',
        passwordHash: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
        accountStatus: 'active',
        verificationStatus: 'verified',
        address: { city: 'New Delhi', state: 'Delhi', pincode: '110001' },
      },
      {
        name: 'Rajesh Sharma Fleet Owner',
        email: 'rajesh.fleet@equipmenthub.com',
        phone: '+919810123456',
        passwordHash: 'Password@123',
        role: 'user',
        accountStatus: 'active',
        verificationStatus: 'verified',
        address: { city: 'Gurugram', state: 'Haryana', pincode: '122002' },
      },
      {
        name: 'Vikram Singh Contractor',
        email: 'vikram.contractor@equipmenthub.com',
        phone: '+919871654321',
        passwordHash: 'Password@123',
        role: 'user',
        accountStatus: 'active',
        verificationStatus: 'verified',
        address: { city: 'Noida', state: 'Uttar Pradesh', pincode: '201305' },
      },
      {
        name: 'Sunil Verma Infra Projects',
        email: 'sunil.infra@equipmenthub.com',
        phone: '+919910987654',
        passwordHash: 'Password@123',
        role: 'user',
        accountStatus: 'active',
        verificationStatus: 'verified',
        address: { city: 'Faridabad', state: 'Haryana', pincode: '121004' },
      },
      {
        name: 'Amit Patel Builders',
        email: 'amit.builder@equipmenthub.com',
        phone: '+919820543210',
        passwordHash: 'Password@123',
        role: 'user',
        accountStatus: 'active',
        verificationStatus: 'verified',
        address: { city: 'New Delhi', state: 'Delhi', pincode: '110020' },
      },
    ];

    const usersMap = {};
    for (const u of usersData) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
      } else {
        existing.role = u.role;
        existing.accountStatus = u.accountStatus;
        existing.verificationStatus = u.verificationStatus;
        await existing.save();
      }
      usersMap[u.email] = existing;
    }
    console.log(`  -> ${Object.keys(usersMap).length} Users seeded.`);

    const rajesh = usersMap['rajesh.fleet@equipmenthub.com'];
    const vikram = usersMap['vikram.contractor@equipmenthub.com'];
    const sunil = usersMap['sunil.infra@equipmenthub.com'];
    const amit = usersMap['amit.builder@equipmenthub.com'];
    const admin = usersMap[process.env.ADMIN_EMAIL || 'admin@equipmenthub.com'];

    // 4. Seed Subscriptions
    console.log('[4/8] Seeding Subscriptions...');
    const now = new Date();
    const futureDate30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const futureDate25 = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
    const futureDate15 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const subscriptionsData = [
      {
        userId: rajesh._id,
        planId: plansMap['business']._id,
        status: 'active',
        startDate: now,
        endDate: futureDate30,
        razorpayOrderId: 'order_seed_rajesh_business',
        razorpayPaymentId: 'pay_seed_rajesh_business',
        autoRenew: true,
      },
      {
        userId: vikram._id,
        planId: plansMap['pro']._id,
        status: 'active',
        startDate: now,
        endDate: futureDate25,
        razorpayOrderId: 'order_seed_vikram_pro',
        razorpayPaymentId: 'pay_seed_vikram_pro',
        autoRenew: true,
      },
      {
        userId: sunil._id,
        planId: plansMap['basic']._id,
        status: 'active',
        startDate: now,
        endDate: futureDate15,
        razorpayOrderId: 'order_seed_sunil_basic',
        razorpayPaymentId: 'pay_seed_sunil_basic',
        autoRenew: false,
      },
    ];

    const subscriptionsMap = {};
    for (const sub of subscriptionsData) {
      let savedSub = await Subscription.findOne({ userId: sub.userId, status: 'active' });
      if (!savedSub) {
        savedSub = await Subscription.create(sub);
      }
      subscriptionsMap[sub.userId.toString()] = savedSub;
    }
    console.log(`  -> ${Object.keys(subscriptionsMap).length} Active Subscriptions seeded.`);

    // 5. Seed Payments
    console.log('[5/8] Seeding Payments...');
    const paymentsData = [
      {
        userId: rajesh._id,
        subscriptionId: subscriptionsMap[rajesh._id.toString()]._id,
        provider: 'razorpay',
        providerOrderId: 'order_seed_rajesh_business',
        providerPaymentId: 'pay_seed_rajesh_business',
        amount: plansMap['business'].price,
        currency: 'INR',
        paymentPurpose: 'subscription',
        status: 'verified',
        notes: { planCode: 'business', planName: 'Business Fleet' },
      },
      {
        userId: vikram._id,
        subscriptionId: subscriptionsMap[vikram._id.toString()]._id,
        provider: 'razorpay',
        providerOrderId: 'order_seed_vikram_pro',
        providerPaymentId: 'pay_seed_vikram_pro',
        amount: plansMap['pro'].price,
        currency: 'INR',
        paymentPurpose: 'subscription',
        status: 'verified',
        notes: { planCode: 'pro', planName: 'Pro Plan' },
      },
      {
        userId: sunil._id,
        subscriptionId: subscriptionsMap[sunil._id.toString()]._id,
        provider: 'razorpay',
        providerOrderId: 'order_seed_sunil_basic',
        providerPaymentId: 'pay_seed_sunil_basic',
        amount: plansMap['basic'].price,
        currency: 'INR',
        paymentPurpose: 'subscription',
        status: 'verified',
        notes: { planCode: 'basic', planName: 'Basic Plan' },
      },
    ];

    for (const p of paymentsData) {
      const exists = await Payment.findOne({ providerOrderId: p.providerOrderId });
      if (!exists) {
        await Payment.create(p);
      }
    }
    console.log(`  -> ${paymentsData.length} Subscription Payments seeded.`);

    // 6. Seed Equipment (Realistic Machinery with Coordinates)
    console.log('[6/8] Seeding Equipment...');
    const equipmentItems = [
      {
        ownerId: rajesh._id,
        name: 'JCB 3DX Super EcoXcellence Backhoe Loader',
        categoryId: categoriesMap['jcb-excavators'],
        brand: 'JCB',
        model: '3DX Super EcoMax',
        year: 2022,
        description: 'Heavy-duty 4WD JCB backhoe loader with 1.1 m³ loader bucket and 0.24 m³ digging bucket. Ideal for canal digging, construction basements, and bulk loading. EcoMax 76 HP engine with certified driver.',
        condition: 'excellent',
        photos: [
          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/JCB_3CX_ECO_backhoe_loader_at_VDNKh%2C_Moscow.jpg/2560px-JCB_3CX_ECO_backhoe_loader_at_VDNKh%2C_Moscow.jpg',
        ],
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
        ownerId: rajesh._id,
        name: 'Caterpillar 320D2 GC Hydraulic Crawler Excavator',
        categoryId: categoriesMap['jcb-excavators'],
        brand: 'Caterpillar',
        model: '320D2 GC',
        year: 2021,
        description: '20-ton class heavy crawler excavator for bulk earthmoving, rock breaking, and deep canal works. Regular Cat dealer maintenance, 1.0 cu.m heavy bucket, air-conditioned cabin.',
        condition: 'excellent',
        photos: [
          'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80',
        ],
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
        ownerId: vikram._id,
        name: 'ACE 25-Ton Hydraulic Mobile Pick & Carry Crane',
        categoryId: categoriesMap['cranes-lifting'],
        brand: 'ACE',
        model: '15XF / 25T Telescopic',
        year: 2023,
        description: 'Heavy telescopic crane with 4-part boom extending up to 21 meters. Equipped with load moment indicator (LMI), safety outriggers, and certified RTO crane operator.',
        condition: 'excellent',
        photos: [
          'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80',
        ],
        hourlyRate: 2200,
        dailyRate: 16500,
        monthlyRate: 380000,
        securityDeposit: 40000,
        deliveryCharges: 7000,
        operatorOption: 'included',
        location: {
          type: 'Point',
          coordinates: [77.3178, 28.3845], // Faridabad
        },
        address: {
          street: 'Sector 24 Heavy Industrial Area',
          area: 'Bata Chowk',
          city: 'Faridabad',
          state: 'Haryana',
          pincode: '121005',
        },
        deliveryRadiusKm: 50,
        approvalStatus: 'approved',
        listingStatus: 'active',
      },
      {
        ownerId: vikram._id,
        name: 'Kirloskar 125 kVA Silent Acoustic Diesel Generator',
        categoryId: categoriesMap['generators-power'],
        brand: 'Kirloskar',
        model: 'KG1-125WS',
        year: 2022,
        description: 'Low-noise CPCB-II compliant silent generator with AMF auto-switch panel. Suitable for continuous concrete batching plants, commercial construction sites, and emergency hospital backup.',
        condition: 'good',
        photos: [
          'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
        ],
        hourlyRate: 600,
        dailyRate: 4200,
        monthlyRate: 98000,
        securityDeposit: 15000,
        deliveryCharges: 2500,
        operatorOption: 'optional',
        location: {
          type: 'Point',
          coordinates: [77.271, 28.536], // Okhla New Delhi
        },
        address: {
          street: 'B-70, Okhla Industrial Area Phase-III',
          area: 'Near Modi Mill',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110020',
        },
        deliveryRadiusKm: 45,
        approvalStatus: 'approved',
        listingStatus: 'active',
      },
      {
        ownerId: sunil._id,
        name: 'John Deere 5310 4WD Heavy Construction Tractor',
        categoryId: categoriesMap['tractors-farm'],
        brand: 'John Deere',
        model: '5310 GearPro 4WD',
        year: 2020,
        description: '55 HP heavy duty tractor equipped with rear hydraulic trolley hitch, scraper blade, and laser land leveler attachment. Ideal for site leveling and material towing.',
        condition: 'good',
        photos: [
          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
        ],
        hourlyRate: 500,
        dailyRate: 3800,
        monthlyRate: 85000,
        securityDeposit: 10000,
        deliveryCharges: 2000,
        operatorOption: 'optional',
        location: {
          type: 'Point',
          coordinates: [77.503, 28.4744], // Greater Noida
        },
        address: {
          street: 'Surajpur Industrial Area Site-B',
          area: 'Pari Chowk Road',
          city: 'Greater Noida',
          state: 'Uttar Pradesh',
          pincode: '201306',
        },
        deliveryRadiusKm: 70,
        approvalStatus: 'approved',
        listingStatus: 'active',
      },
      {
        ownerId: sunil._id,
        name: 'Schwing Stetter 6 Cu.M Self-Loading Transit Concrete Mixer',
        categoryId: categoriesMap['concrete-mixers'],
        brand: 'Schwing Stetter',
        model: 'AM 6 FHC',
        year: 2023,
        description: '6 cubic meter high-output transit mixer with hydraulic chute adjustment and electronic water meter. Mounted on robust Ashok Leyland multi-axle chassis with verified driver.',
        condition: 'excellent',
        photos: [
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
        ],
        hourlyRate: 1300,
        dailyRate: 9200,
        monthlyRate: 215000,
        securityDeposit: 25000,
        deliveryCharges: 4000,
        operatorOption: 'included',
        location: {
          type: 'Point',
          coordinates: [77.3712, 28.672], // Ghaziabad
        },
        address: {
          street: 'Site-4 Industrial Area Sahibabad',
          area: 'Near Mohan Nagar',
          city: 'Ghaziabad',
          state: 'Uttar Pradesh',
          pincode: '201010',
        },
        deliveryRadiusKm: 55,
        approvalStatus: 'approved',
        listingStatus: 'active',
      },
    ];

    const seededEquipments = [];
    for (const item of equipmentItems) {
      let eq = await Equipment.findOne({ name: item.name });
      if (!eq) {
        eq = await Equipment.create(item);
      } else {
        Object.assign(eq, item);
        await eq.save();
      }
      seededEquipments.push(eq);
    }
    console.log(`  -> ${seededEquipments.length} Heavy Machines seeded.`);

    const jcbMachine = seededEquipments[0];
    const catExcavator = seededEquipments[1];
    const generator = seededEquipments[3];

    // 7. Seed Bookings (Across different workflow statuses)
    console.log('[7/8] Seeding Bookings...');
    const startDateBooking1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const endDateBooking1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const startDateBooking2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const endDateBooking2 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const startDateBooking3 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const endDateBooking3 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startDateBooking4 = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
    const endDateBooking4 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    const bookingsData = [
      {
        equipmentId: jcbMachine._id,
        ownerId: jcbMachine.ownerId,
        renterId: amit._id,
        startDate: startDateBooking1,
        endDate: endDateBooking1,
        rentalDurationDays: 3,
        operatorRequested: true,
        pricingBreakdown: {
          dailyRatePaise: 850000,
          rentalBasePaise: 2550000,
          deliveryChargesPaise: 350000,
          securityDepositPaise: 2000000,
          taxPaise: 459000,
          totalAmountPaise: 5359000, // ₹53,590
        },
        bookingStatus: 'Confirmed',
        paymentStatus: 'paid',
        depositStatus: 'held',
        deliveryAddress: {
          street: 'Plot 105, Expressway Sector 128',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201304',
          notes: 'Deliver before 8:00 AM at gate 2',
        },
      },
      {
        equipmentId: catExcavator._id,
        ownerId: catExcavator.ownerId,
        renterId: sunil._id,
        startDate: startDateBooking2,
        endDate: endDateBooking2,
        rentalDurationDays: 5,
        operatorRequested: true,
        pricingBreakdown: {
          dailyRatePaise: 1400000,
          rentalBasePaise: 7000000,
          deliveryChargesPaise: 600000,
          securityDepositPaise: 3500000,
          taxPaise: 1260000,
          totalAmountPaise: 12360000, // ₹1,23,600
        },
        bookingStatus: 'Ongoing',
        paymentStatus: 'paid',
        depositStatus: 'held',
        handoverDetails: {
          handedOverAt: startDateBooking2,
          initialMeterHours: 1420,
          notes: 'Fuel tank full. Machine handed over in excellent condition.',
        },
        deliveryAddress: {
          street: 'Flyover Construction Pier 44, Mathura Road',
          city: 'Faridabad',
          state: 'Haryana',
          pincode: '121003',
        },
      },
      {
        equipmentId: generator._id,
        ownerId: generator.ownerId,
        renterId: amit._id,
        startDate: startDateBooking3,
        endDate: endDateBooking3,
        rentalDurationDays: 3,
        operatorRequested: false,
        pricingBreakdown: {
          dailyRatePaise: 420000,
          rentalBasePaise: 1260000,
          deliveryChargesPaise: 250000,
          securityDepositPaise: 1500000,
          taxPaise: 226800,
          totalAmountPaise: 3236800, // ₹32,368
        },
        bookingStatus: 'Completed',
        paymentStatus: 'paid',
        depositStatus: 'refunded',
        handoverDetails: {
          handedOverAt: startDateBooking3,
          returnedAt: endDateBooking3,
          initialMeterHours: 350,
          finalMeterHours: 374,
          notes: 'Returned smoothly, zero damages. Deposit refunded.',
        },
        deliveryAddress: {
          street: 'Jasola Vihar Commercial Complex',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110025',
        },
      },
      {
        equipmentId: jcbMachine._id,
        ownerId: jcbMachine.ownerId,
        renterId: vikram._id,
        startDate: startDateBooking4,
        endDate: endDateBooking4,
        rentalDurationDays: 2,
        operatorRequested: true,
        pricingBreakdown: {
          dailyRatePaise: 850000,
          rentalBasePaise: 1700000,
          deliveryChargesPaise: 350000,
          securityDepositPaise: 2000000,
          taxPaise: 306000,
          totalAmountPaise: 4356000, // ₹43,560
        },
        bookingStatus: 'Pending',
        paymentStatus: 'pending',
        depositStatus: 'pending',
        deliveryAddress: {
          street: 'Sector 57 Commercial Plaza',
          city: 'Gurugram',
          state: 'Haryana',
          pincode: '122003',
        },
      },
    ];

    for (const b of bookingsData) {
      const exists = await Booking.findOne({
        equipmentId: b.equipmentId,
        renterId: b.renterId,
        bookingStatus: b.bookingStatus,
      });
      if (!exists) {
        const createdBooking = await Booking.create(b);
        // Create associated rental payment record for paid bookings
        if (b.paymentStatus === 'paid') {
          await Payment.create({
            userId: b.renterId,
            bookingId: createdBooking._id,
            provider: 'razorpay',
            providerOrderId: `order_rental_${createdBooking._id.toString().slice(-6)}`,
            providerPaymentId: `pay_rental_${createdBooking._id.toString().slice(-6)}`,
            amount: b.pricingBreakdown.totalAmountPaise,
            currency: 'INR',
            paymentPurpose: 'rental_fee',
            status: 'verified',
            notes: {
              bookingId: createdBooking._id.toString(),
              equipmentName: jcbMachine.name,
            },
          });
        }
      }
    }
    console.log(`  -> ${bookingsData.length} Rental Bookings (Confirmed, Ongoing, Completed, Pending) seeded.`);

    // 8. Seed Audit Logs
    console.log('[8/8] Seeding Audit Logs...');
    const auditLogsData = [
      {
        adminId: admin._id,
        action: 'EQUIPMENT_APPROVED',
        targetResource: 'Equipment',
        targetId: jcbMachine._id,
        details: 'Admin verified RC book, pollution certificate, and approved JCB 3DX listing for public marketplace.',
        ipAddress: '127.0.0.1',
      },
      {
        adminId: admin._id,
        action: 'USER_KYC_VERIFIED',
        targetResource: 'User',
        targetId: rajesh._id,
        details: 'Verified GSTIN and Aadhaar credentials for Rajesh Sharma Fleet Owner.',
        ipAddress: '127.0.0.1',
      },
      {
        adminId: admin._id,
        action: 'SUBSCRIPTION_PLAN_UPDATED',
        targetResource: 'Subscription',
        targetId: plansMap['pro']._id,
        details: 'Configured Pro listing quota to 10 machines with high-priority search placement.',
        ipAddress: '127.0.0.1',
      },
    ];

    for (const log of auditLogsData) {
      const exists = await AuditLog.findOne({
        targetId: log.targetId,
        action: log.action,
      });
      if (!exists) {
        await AuditLog.create(log);
      }
    }
    console.log(`  -> ${auditLogsData.length} Admin Audit Logs seeded.`);

    console.log('\n======================================================');
    console.log('✅ ALL TABLES SUCCESSFULLY SEEDED WITH SAMPLE DATA!');
    console.log('======================================================');
    console.log('Credentials for Testing:');
    console.log('  Admin User:      admin@equipmenthub.com / Admin@123456');
    console.log('  Fleet Owner:     rajesh.fleet@equipmenthub.com / Password@123');
    console.log('  Contractor:      vikram.contractor@equipmenthub.com / Password@123');
    console.log('  Infra Owner:     sunil.infra@equipmenthub.com / Password@123');
    console.log('  Renter/Builder:  amit.builder@equipmenthub.com / Password@123');
    console.log('======================================================\n');

    if (shouldDisconnect && exitOnFinish) {
      await mongoose.disconnect();
      console.log('[Seed All] MongoDB disconnected.');
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed All Error]:', error);
    if (exitOnFinish) {
      process.exit(1);
    }
    throw error;
  }
}

// If executed directly from command line
if (require.main === module) {
  seedAll(true);
}

module.exports = seedAll;

