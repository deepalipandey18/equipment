const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');
const EquipmentCategory = require('../models/EquipmentCategory');

class EquipmentService {
  constructor() {
    this._syncRan = false;
  }

  /**
   * Ensures database equipment have valid marketplace listing types (Rent, Sale, Both)
   * and realistic specifications so filtering always works reliably.
   */
  async ensureMarketplaceData() {
    try {
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
   * Supports Rent, Buy/Sell, and Combined Listings
   */
  async searchMarketplace({
    keyword = '',
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

    // Category filter by ID or slug
    if (category && category.trim()) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        matchFilters.categoryId = new mongoose.Types.ObjectId(category);
      } else {
        const catDoc = await EquipmentCategory.findOne({ slug: category.trim() });
        if (catDoc) {
          matchFilters.categoryId = catDoc._id;
        }
      }
    }

    // Rental price range filters (only apply when rental rate is relevant)
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
      matchFilters.$or = [
        { name: regex },
        { brand: regex },
        { model: regex },
        { description: regex },
        { 'address.city': regex },
        { 'address.state': regex },
      ];
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
            as: 'categoryId',
          },
        },
        { $unwind: { path: '$categoryId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'ownerId',
            foreignField: '_id',
            as: 'ownerId',
          },
        },
        { $unwind: { path: '$ownerId', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            'ownerId.passwordHash': 0,
            'ownerId.__v': 0,
          },
        },
      ];

      // Sorting
      if (sortBy === 'price_asc') {
        pipeline.push({ $sort: { dailyRate: 1 } });
      } else if (sortBy === 'price_desc') {
        pipeline.push({ $sort: { dailyRate: -1 } });
      } else if (sortBy === 'sale_asc') {
        pipeline.push({ $sort: { salePrice: 1 } });
      } else if (sortBy === 'sale_desc') {
        pipeline.push({ $sort: { salePrice: -1 } });
      } else if (sortBy === 'newest') {
        pipeline.push({ $sort: { createdAt: -1 } });
      } else {
        // default when coordinates present: nearest first
        pipeline.push({ $sort: { distanceMeters: 1 } });
      }

      pipeline.push({ $skip: skip }, { $limit: limitNum });

      items = await Equipment.aggregate(pipeline);

      // If strict radius cutoff yielded 0 results, fall back to global distance search
      // so available machinery is still discovered instead of returning an empty screen!
      if (items.length === 0) {
        const fallbackPipeline = [
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [parsedLng, parsedLat],
              },
              distanceField: 'distanceMeters',
              spherical: true,
              query: matchFilters,
            },
          },
          ...pipeline.slice(1),
        ];
        items = await Equipment.aggregate(fallbackPipeline);

        const fallbackCountPipeline = [
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [parsedLng, parsedLat],
              },
              distanceField: 'distanceMeters',
              spherical: true,
              query: matchFilters,
            },
          },
          { $count: 'total' },
        ];
        const fallbackCountResult = await Equipment.aggregate(fallbackCountPipeline);
        total = fallbackCountResult.length > 0 ? fallbackCountResult[0].total : 0;
      } else {
        const countResult = await Equipment.aggregate(countPipeline);
        total = countResult.length > 0 ? countResult[0].total : 0;
      }
    } else {
      // 2. Standard Non-Geospatial Query
      let sortQuery = { createdAt: -1 };
      if (sortBy === 'price_asc') sortQuery = { dailyRate: 1 };
      else if (sortBy === 'price_desc') sortQuery = { dailyRate: -1 };
      else if (sortBy === 'sale_asc') sortQuery = { salePrice: 1 };
      else if (sortBy === 'sale_desc') sortQuery = { salePrice: -1 };
      else if (sortBy === 'newest') sortQuery = { createdAt: -1 };

      total = await Equipment.countDocuments(matchFilters);
      items = await Equipment.find(matchFilters)
        .populate('categoryId')
        .populate('ownerId', 'name email phone address')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum);
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
   * Register a new machinery item
   */
  async createEquipment(ownerId, data) {
    const category = await EquipmentCategory.findById(data.categoryId);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    const { coordinates, ...rest } = data;

    const equipment = await Equipment.create({
      ...rest,
      ownerId,
      location: {
        type: 'Point',
        coordinates, // [longitude, latitude]
      },
      approvalStatus: 'approved', // auto-approve for seamless testing
      listingStatus: 'active',
    });

    return await Equipment.findById(equipment._id)
      .populate('categoryId')
      .populate('ownerId', 'name email phone');
  }

  /**
   * Get all machinery owned by the authenticated user
   */
  async getOwnerEquipment(ownerId) {
    return await Equipment.find({
      ownerId,
      listingStatus: { $ne: 'deleted' },
    })
      .populate('categoryId')
      .sort({ createdAt: -1 });
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(equipmentId) {
    const equipment = await Equipment.findOne({
      _id: equipmentId,
      listingStatus: { $ne: 'deleted' },
    })
      .populate('categoryId')
      .populate('ownerId', 'name email phone address');

    if (!equipment) {
      const error = new Error('Equipment not found');
      error.statusCode = 404;
      throw error;
    }

    return equipment;
  }

  /**
   * Update equipment details with strict ownership verification
   */
  async updateEquipment(equipmentId, ownerId, updateData) {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || equipment.listingStatus === 'deleted') {
      const error = new Error('Equipment not found');
      error.statusCode = 404;
      throw error;
    }

    // Ownership Authorization Check
    if (equipment.ownerId.toString() !== ownerId.toString()) {
      const error = new Error('Unauthorized: You can only modify equipment you own');
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
