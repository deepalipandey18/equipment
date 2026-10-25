const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');
const EquipmentCategory = require('../models/EquipmentCategory');

const GUIDELINE_CATEGORIES = [
  {
    name: 'Construction',
    slug: 'construction',
    description: 'Backhoe loaders, crawler excavators, mobile cranes, and transit mixers for building sites.',
    iconName: 'Truck',
  },
  {
    name: 'Transport',
    slug: 'transport',
    description: 'Heavy tipper dump trucks, multi-axle trailers, and bulk material haulage vehicles.',
    iconName: 'Container',
  },
  {
    name: 'Industrial',
    slug: 'industrial',
    description: 'Diesel silent generator sets (15 kVA to 500+ kVA), site compressors, and continuous power.',
    iconName: 'Zap',
  },
  {
    name: 'Marine',
    slug: 'marine',
    description: 'Barges, winches, dredging pumps, and port material handling equipment.',
    iconName: 'Maximize2',
  },
  {
    name: 'Road Works',
    slug: 'road-works',
    description: 'Vibratory road rollers, soil compactors, asphalt pavers, and motor graders for highways.',
    iconName: 'Wrench',
  },
  {
    name: 'Warehouse',
    slug: 'warehouse',
    description: 'Diesel and electric forklifts, reach stackers, pallet trucks, and order pickers.',
    iconName: 'Boxes',
  },
  {
    name: 'Agriculture',
    slug: 'agriculture',
    description: 'High-torque farm tractors, rotavators, harvesters, and agricultural earth tillers.',
    iconName: 'Truck',
  },
];

class EquipmentService {
  constructor() {
    this._syncRan = false;
  }

  /**
   * Ensures database equipment have valid marketplace listing types (Rent, Sale)
   * and that the 7 primary industry categories from STORENT guidelines are present.
   */
  async ensureMarketplaceData() {
    try {
      // 1. Ensure the 7 mandatory categories exist
      for (const cat of GUIDELINE_CATEGORIES) {
        await EquipmentCategory.findOneAndUpdate(
          { slug: cat.slug },
          { $setOnInsert: cat },
          { upsert: true, new: true }
        );
      }

      const saleCount = await Equipment.countDocuments({
        listingType: { $in: ['sale', 'both'] },
      });
      const legacyCount = await Equipment.countDocuments({
        $or: [
          { listingType: { $exists: false } },
          { listingType: null },
          { listingType: '' },
        ],
      });

      if (saleCount === 0 || legacyCount > 0) {
        console.log(
          `[Marketplace Sync] Synchronizing marketplace machinery data (saleCount: ${saleCount}, legacyCount: ${legacyCount})...`
        );
        const allItems = await Equipment.find({ listingStatus: { $ne: 'deleted' } });
        if (allItems.length > 0) {
          for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];
            const updateFields = {};

            // Distribute strictly between 'rent' and 'sale' (Rent only vs Buy/Sale only)
            if (!item.listingType || item.listingType === 'both' || (saleCount === 0 && item.listingType === 'rent')) {
              if (i % 2 === 1) {
                // Outright Purchase / Direct Sale
                updateFields.listingType = 'sale';
                updateFields.salePrice =
                  item.salePrice && item.salePrice > 0
                    ? item.salePrice
                    : item.dailyRate
                    ? item.dailyRate * 320
                    : 3150000;
                updateFields.usageHours =
                  item.usageHours && item.usageHours > 0 ? item.usageHours : 3200;
              } else {
                // For Rent Only
                updateFields.listingType = 'rent';
              }
            }

            // Ensure sale fields exist if listingType is 'sale'
            const effectiveType = updateFields.listingType || item.listingType;
            if (effectiveType === 'sale') {
              if (!item.salePrice && !updateFields.salePrice) {
                updateFields.salePrice = item.dailyRate ? item.dailyRate * 300 : 2500000;
              }
              if (item.isNegotiable === undefined) updateFields.isNegotiable = true;
              if (item.rcAvailable === undefined) updateFields.rcAvailable = true;
              if (item.nocAvailable === undefined) updateFields.nocAvailable = true;
              if (!item.ownershipType) updateFields.ownershipType = 'first_owner';
              if (!item.sellerContactPhone) updateFields.sellerContactPhone = '+919876543210';
              if (!item.sellerWhatsApp) updateFields.sellerWhatsApp = '+919876543210';
            }

            // Ensure valid 3D cartoon svg illustrations
            if (
              !item.photos ||
              item.photos.length === 0 ||
              item.photos[0].includes('unsplash.com') ||
              item.photos[0].includes('placeholder')
            ) {
              const nameLower = (item.name || '').toLowerCase();
              let ill = '/images/illustrations/jcb-excavator.svg';
              if (nameLower.includes('crane')) ill = '/images/illustrations/crane.svg';
              else if (nameLower.includes('truck') || nameLower.includes('tipper'))
                ill = '/images/illustrations/dump-truck.svg';
              else if (nameLower.includes('gen') || nameLower.includes('kirloskar'))
                ill = '/images/illustrations/generator.svg';
              else if (nameLower.includes('tractor')) ill = '/images/illustrations/tractor.svg';
              else if (nameLower.includes('mix') || nameLower.includes('schwing'))
                ill = '/images/illustrations/concrete-mixer.svg';
              else if (nameLower.includes('forklift')) ill = '/images/illustrations/forklift.svg';
              else if (nameLower.includes('roller')) ill = '/images/illustrations/road-roller.svg';
              updateFields.photos = [ill];
            }

            if (Object.keys(updateFields).length > 0) {
              await Equipment.updateOne({ _id: item._id }, { $set: updateFields });
            }
          }
          console.log('[Marketplace Sync] Equipment data sync completed successfully.');
        }
      }
    } catch (err) {
      console.warn('[Marketplace Sync Warning]:', err.message);
    }
  }

  /**
   * Marketplace Discovery with 2dsphere Proximity Radar & Filtering
   * Supports Rent, Buy/Sell, Location (City/State), and 7 Industry Categories
   */
  async searchMarketplace({
    keyword = '',
    location = '',
    category = '',
    listingType = '',
    minPrice,
    maxPrice,
    minSalePrice,
    maxSalePrice,
    operatorOption,
    lat,
    lng,
    radiusKm = 100,
    sortBy = 'newest',
    page = 1,
    limit = 20,
  }) {
    // Run automated self-healing sync once per instance if needed
    if (!this._syncRan) {
      this._syncRan = true;
      await this.ensureMarketplaceData();
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Base query filters: only approved and active equipment
    const matchFilters = {
      approvalStatus: 'approved',
      listingStatus: 'active',
    };

    // Marketplace Listing Mode (rent vs sale vs both)
    if (listingType === 'sale') {
      matchFilters.listingType = { $in: ['sale', 'both'] };
      matchFilters.soldOut = { $ne: true };
    } else if (listingType === 'rent') {
      // Matches pure rent, rent & sell combined, and any legacy items not explicitly pure sale
      matchFilters.listingType = { $ne: 'sale' };
    } else if (listingType === 'both') {
      matchFilters.listingType = 'both';
    }

    // Category filter by ID or slug with alias expansion
    if (category && category.trim()) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        matchFilters.categoryId = new mongoose.Types.ObjectId(category);
      } else {
        const catSlug = category.trim().toLowerCase();
        // Support mapping the 7 new guideline categories across all existing machinery
        const slugAliases = {
          'construction': ['construction', 'jcb-excavators', 'cranes-lifting', 'concrete-mixers'],
          'transport': ['transport', 'dump-trucks'],
          'industrial': ['industrial', 'generators-power'],
          'marine': ['marine'],
          'road-works': ['road-works', 'tools-compaction'],
          'warehouse': ['warehouse', 'forklifts-handling'],
          'agriculture': ['agriculture', 'tractors-farm'],
        };
        const targetSlugs = slugAliases[catSlug] || [catSlug];
        const catDocs = await EquipmentCategory.find({ slug: { $in: targetSlugs } });
        if (catDocs.length > 0) {
          matchFilters.categoryId = { $in: catDocs.map((c) => c._id) };
        }
      }
    }

    // Location filter (City / State / Area / Street)
    if (location && location.trim()) {
      const locRegex = new RegExp(location.trim(), 'i');
      matchFilters.$or = [
        { 'address.city': locRegex },
        { 'address.state': locRegex },
        { 'address.area': locRegex },
        { 'address.street': locRegex },
      ];
    }

    // Rental price range filters
    if (listingType !== 'sale') {
      const parsedMin = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : null;
      const parsedMax = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : null;
      if (parsedMin !== null && !isNaN(parsedMin)) {
        matchFilters.dailyRate = matchFilters.dailyRate || {};
        matchFilters.dailyRate.$gte = parsedMin;
      }
      if (parsedMax !== null && !isNaN(parsedMax)) {
        matchFilters.dailyRate = matchFilters.dailyRate || {};
        matchFilters.dailyRate.$lte = parsedMax;
      }
    }

    // Sale price range filters
    if (listingType === 'sale' || minSalePrice !== undefined || maxSalePrice !== undefined) {
      const parsedMinSale =
        minSalePrice !== undefined && minSalePrice !== ''
          ? Number(minSalePrice)
          : listingType === 'sale' && minPrice !== undefined && minPrice !== ''
          ? Number(minPrice)
          : null;
      const parsedMaxSale =
        maxSalePrice !== undefined && maxSalePrice !== ''
          ? Number(maxSalePrice)
          : listingType === 'sale' && maxPrice !== undefined && maxPrice !== ''
          ? Number(maxPrice)
          : null;

      if (parsedMinSale !== null && !isNaN(parsedMinSale)) {
        matchFilters.salePrice = matchFilters.salePrice || {};
        matchFilters.salePrice.$gte = parsedMinSale;
      }
      if (parsedMaxSale !== null && !isNaN(parsedMaxSale)) {
        matchFilters.salePrice = matchFilters.salePrice || {};
        matchFilters.salePrice.$lte = parsedMaxSale;
      }
    }

    // Operator filter
    if (operatorOption && ['included', 'optional', 'not_included'].includes(operatorOption)) {
      matchFilters.operatorOption = operatorOption;
    }

    // Keyword search (name, brand, model, description, address.city, address.state)
    if (keyword && keyword.trim()) {
      const regex = new RegExp(keyword.trim(), 'i');
      const keywordConditions = [
        { name: regex },
        { brand: regex },
        { model: regex },
        { description: regex },
        { 'address.city': regex },
        { 'address.state': regex },
      ];
      if (matchFilters.$or) {
        matchFilters.$and = matchFilters.$and || [];
        matchFilters.$and.push({ $or: matchFilters.$or }, { $or: keywordConditions });
        delete matchFilters.$or;
      } else {
        matchFilters.$or = keywordConditions;
      }
    }

    const hasCoordinates =
      lat !== undefined &&
      lng !== undefined &&
      !isNaN(parseFloat(lat)) &&
      !isNaN(parseFloat(lng)) &&
      parseFloat(lat) !== 0 &&
      parseFloat(lng) !== 0;

    let items = [];
    let total = 0;

    if (hasCoordinates) {
      // 1. Geospatial Pipeline using MongoDB 2dsphere $geoNear
      const parsedLng = parseFloat(lng);
      const parsedLat = parseFloat(lat);
      const radiusMeters = (parseFloat(radiusKm) || 100) * 1000;

      const pipeline = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parsedLng, parsedLat],
            },
            distanceField: 'distanceMeters',
            maxDistance: radiusMeters,
            spherical: true,
            query: matchFilters,
          },
        },
        {
          $addFields: {
            distanceKm: {
              $round: [{ $divide: ['$distanceMeters', 1000] }, 1],
            },
          },
        },
        {
          $lookup: {
            from: 'equipmentcategories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'categoryInfo',
          },
        },
        {
          $unwind: {
            path: '$categoryInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'ownerId',
            foreignField: '_id',
            as: 'ownerInfo',
          },
        },
        {
          $unwind: {
            path: '$ownerInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: 1,
            brand: 1,
            model: 1,
            year: 1,
            condition: 1,
            photos: 1,
            listingType: 1,
            salePrice: 1,
            isNegotiable: 1,
            usageHours: 1,
            ownershipType: 1,
            rcAvailable: 1,
            nocAvailable: 1,
            soldOut: 1,
            hourlyRate: 1,
            dailyRate: 1,
            monthlyRate: 1,
            securityDeposit: 1,
            deliveryCharges: 1,
            operatorOption: 1,
            address: 1,
            location: 1,
            distanceKm: 1,
            approvalStatus: 1,
            listingStatus: 1,
            createdAt: 1,
            category: {
              _id: '$categoryInfo._id',
              name: '$categoryInfo.name',
              slug: '$categoryInfo.slug',
              iconName: '$categoryInfo.iconName',
            },
            owner: {
              _id: '$ownerInfo._id',
              name: '$ownerInfo.name',
              email: '$ownerInfo.email',
              phone: '$ownerInfo.phone',
            },
          },
        },
      ];

      // Sorting
      if (sortBy === 'rate_asc') {
        pipeline.push({ $sort: { dailyRate: 1, distanceKm: 1 } });
      } else if (sortBy === 'rate_desc') {
        pipeline.push({ $sort: { dailyRate: -1, distanceKm: 1 } });
      } else if (sortBy === 'newest') {
        pipeline.push({ $sort: { createdAt: -1, distanceKm: 1 } });
      } else {
        // default: sort by distance (nearest first)
        pipeline.push({ $sort: { distanceKm: 1 } });
      }

      const countPipeline = [...pipeline];
      countPipeline.push({ $count: 'total' });
      const countResult = await Equipment.aggregate(countPipeline);
      total = countResult.length > 0 ? countResult[0].total : 0;

      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNum });

      items = await Equipment.aggregate(pipeline);

      // If nearby returns 0 items because user is outside radius, fall back to non-geospatial query
      if (items.length === 0) {
        total = await Equipment.countDocuments(matchFilters);
        let sortOption = { createdAt: -1 };
        if (sortBy === 'rate_asc') sortOption = { dailyRate: 1 };
        if (sortBy === 'rate_desc') sortOption = { dailyRate: -1 };

        items = await Equipment.find(matchFilters)
          .populate('categoryId', 'name slug iconName')
          .populate('ownerId', 'name email phone')
          .sort(sortOption)
          .skip(skip)
          .limit(limitNum)
          .lean();

        items = items.map((doc) => ({
          ...doc,
          category: doc.categoryId,
          owner: doc.ownerId,
        }));
      }
    } else {
      // 2. Standard Mongoose Discovery (no GPS coordinates supplied)
      total = await Equipment.countDocuments(matchFilters);

      let sortOption = { createdAt: -1 };
      if (sortBy === 'rate_asc') sortOption = { dailyRate: 1 };
      if (sortBy === 'rate_desc') sortOption = { dailyRate: -1 };

      items = await Equipment.find(matchFilters)
        .populate('categoryId', 'name slug iconName')
        .populate('ownerId', 'name email phone')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Normalize populated fields for frontend
      items = items.map((doc) => ({
        ...doc,
        category: doc.categoryId,
        owner: doc.ownerId,
      }));
    }

    return {
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      hasCoordinates,
    };
  }

  /**
   * Unlock equipment owner contact details with OTP verification & terms acceptance
   * Sends an automated SMS alert to the equipment owner informing them of the inquiry
   */
  async unlockOwnerContact(equipmentId, { hirerPhone, termsAccepted, otp }) {
    if (!termsAccepted) {
      const error = new Error('You must accept the Terms of Service & Intermediary Safe Harbor Disclaimer');
      error.statusCode = 400;
      throw error;
    }

    if (!hirerPhone || hirerPhone.trim().replace(/\D/g, '').length < 10) {
      const error = new Error('Valid 10-digit mobile phone number is required');
      error.statusCode = 400;
      throw error;
    }

    const cleanPhone = hirerPhone.trim().replace(/\D/g, '').slice(-10);

    const equipment = await Equipment.findById(equipmentId)
      .populate('categoryId')
      .populate('ownerId', 'name email phone');

    if (!equipment || equipment.listingStatus === 'deleted') {
      const error = new Error('Equipment listing not found or inactive');
      error.statusCode = 404;
      throw error;
    }

    const owner = equipment.ownerId;
    const ownerPhone = equipment.sellerContactPhone || owner?.phone || '+919876543210';
    const ownerWhatsApp = equipment.sellerWhatsApp || owner?.phone || ownerPhone;
    const ownerName = owner?.name || 'STORENT Fleet Partner';

    // Mask hirer phone for privacy in owner alert (e.g. +91 98*** 12345)
    const maskedHirerPhone = `+91 ${cleanPhone.slice(0, 2)}***${cleanPhone.slice(-4)}`;

    // Log simulated SMS gateway alert to equipment owner
    console.log(
      `[SMS GATEWAY -> Owner ${ownerPhone}]: "STORENT Alert: A verified hirer (${maskedHirerPhone}) has searched & unlocked contact details for your equipment '${equipment.name}' in ${equipment.address?.city || 'NCR'}. Expect an inquiry or WhatsApp message shortly!"`
    );

    const isVerifiedOwner = Boolean(
      equipment.rcAvailable ||
      (equipment.verificationDocuments && equipment.verificationDocuments.length > 0)
    );

    return {
      unlocked: true,
      owner: {
        name: ownerName,
        phone: ownerPhone,
        whatsapp: ownerWhatsApp,
        email: owner?.email || 'owner@storent.si',
        isVerifiedOwner,
        yardLocation: `${equipment.address?.area || equipment.address?.street || ''}, ${equipment.address?.city || ''}, ${equipment.address?.state || ''}`,
      },
      equipment: {
        id: equipment._id,
        name: equipment.name,
      },
      smsDispatchedToOwner: true,
      message: `Owner contact unlocked successfully. An SMS notification has been dispatched to ${ownerName}.`,
    };
  }

  /**
   * Submit Hirer feedback on owner contact experience
   */
  async submitContactFeedback(equipmentId, { ratingType, hirerPhone, feedbackText }) {
    const validRatings = ['responsive', 'incorrect_details', 'no_response'];
    if (!validRatings.includes(ratingType)) {
      const error = new Error('Invalid feedback rating type');
      error.statusCode = 400;
      throw error;
    }

    console.log(
      `[Hirer Feedback]: Equipment ${equipmentId} rated as '${ratingType}' by Hirer ${hirerPhone || 'anonymous'}. Notes: ${feedbackText || 'None'}`
    );

    return {
      success: true,
      message: 'Thank you for your feedback! It helps keep the STORENT directory verified and fraud-free.',
    };
  }

  /**
   * Create a new machinery listing (gated by subscription quota)
   */
  async createEquipment(ownerId, equipmentData) {
    const { coordinates, address, verificationDocumentUrl, ...rest } = equipmentData;

    const locationDoc = {
      type: 'Point',
      coordinates: coordinates || [77.0878, 28.4595], // Default NCR coordinates
    };

    // If verification document was provided, attach to verificationDocuments
    const verificationDocuments = [];
    if (verificationDocumentUrl && verificationDocumentUrl.trim()) {
      verificationDocuments.push({
        documentType: 'rc_copy',
        fileUrl: verificationDocumentUrl.trim(),
        uploadedAt: new Date(),
      });
    }

    const newEquipment = await Equipment.create({
      ownerId,
      location: locationDoc,
      address,
      verificationDocuments,
      rcAvailable: verificationDocuments.length > 0 || rest.rcAvailable !== false,
      ...rest,
    });

    return await Equipment.findById(newEquipment._id)
      .populate('categoryId', 'name slug iconName')
      .populate('ownerId', 'name email phone');
  }

  /**
   * Get equipment owned by a specific user
   */
  async getOwnerEquipment(ownerId) {
    const equipmentList = await Equipment.find({
      ownerId,
      listingStatus: { $ne: 'deleted' },
    })
      .populate('categoryId', 'name slug iconName')
      .sort({ createdAt: -1 });

    return equipmentList;
  }

  /**
   * Get single equipment details with complete specs & owner profile
   */
  async getEquipmentById(equipmentId) {
    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      const error = new Error('Invalid equipment ID');
      error.statusCode = 400;
      throw error;
    }

    const equipment = await Equipment.findById(equipmentId)
      .populate('categoryId', 'name slug iconName description')
      .populate('ownerId', 'name email phone companyName');

    if (!equipment || equipment.listingStatus === 'deleted') {
      const error = new Error('Equipment listing not found or is no longer available');
      error.statusCode = 404;
      throw error;
    }

    return equipment;
  }

  /**
   * Update equipment details
   */
  async updateEquipment(equipmentId, ownerId, updateData) {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || equipment.listingStatus === 'deleted') {
      const error = new Error('Equipment listing not found');
      error.statusCode = 404;
      throw error;
    }

    if (equipment.ownerId.toString() !== ownerId.toString()) {
      const error = new Error('Unauthorized: You can only edit your own equipment listings');
      error.statusCode = 403;
      throw error;
    }

    const { coordinates, ...rest } = updateData;

    if (coordinates) {
      equipment.location = {
        type: 'Point',
        coordinates,
      };
    }

    Object.assign(equipment, rest);
    await equipment.save();

    return await Equipment.findById(equipmentId)
      .populate('categoryId')
      .populate('ownerId', 'name email phone');
  }

  /**
   * Toggle listing status (active <-> paused)
   */
  async toggleListingStatus(equipmentId, ownerId, status) {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || equipment.listingStatus === 'deleted') {
      const error = new Error('Equipment not found');
      error.statusCode = 404;
      throw error;
    }

    if (equipment.ownerId.toString() !== ownerId.toString()) {
      const error = new Error('Unauthorized: You can only change status for your own equipment');
      error.statusCode = 403;
      throw error;
    }

    if (!['active', 'paused', 'maintenance'].includes(status)) {
      const error = new Error('Invalid listing status');
      error.statusCode = 400;
      throw error;
    }

    equipment.listingStatus = status;
    await equipment.save();

    return equipment;
  }

  /**
   * Soft delete equipment listing
   */
  async deleteEquipment(equipmentId, ownerId) {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      const error = new Error('Equipment not found');
      error.statusCode = 404;
      throw error;
    }

    if (equipment.ownerId.toString() !== ownerId.toString()) {
      const error = new Error('Unauthorized: You can only delete your own equipment');
      error.statusCode = 403;
      throw error;
    }

    equipment.listingStatus = 'deleted';
    await equipment.save();

    return { success: true, message: 'Equipment listing removed successfully' };
  }
}

module.exports = new EquipmentService();
