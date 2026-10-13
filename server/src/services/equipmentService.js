const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');
const EquipmentCategory = require('../models/EquipmentCategory');

class EquipmentService {
  /**
   * Marketplace Discovery with 2dsphere Proximity Radar & Filtering
   */
  async searchMarketplace({
    keyword = '',
    category = '',
    minPrice,
    maxPrice,
    operatorOption,
    lat,
    lng,
    radiusKm = 100,
    sortBy = 'newest',
    page = 1,
    limit = 20,
  }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Base query filters: only approved and active equipment
    const matchFilters = {
      approvalStatus: 'approved',
      listingStatus: 'active',
    };

    // Category filter by ID or slug
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        matchFilters.categoryId = new mongoose.Types.ObjectId(category);
      } else {
        const catDoc = await EquipmentCategory.findOne({ slug: category });
        if (catDoc) {
          matchFilters.categoryId = catDoc._id;
        }
      }
    }

    // Price range filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      matchFilters.dailyRate = {};
      if (minPrice !== undefined && !isNaN(minPrice)) {
        matchFilters.dailyRate.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        matchFilters.dailyRate.$lte = Number(maxPrice);
      }
    }

    // Operator filter
    if (operatorOption && ['included', 'optional', 'not_included'].includes(operatorOption)) {
      matchFilters.operatorOption = operatorOption;
    }

    // Keyword search (name, brand, model, description, address.city)
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
      } else if (sortBy === 'newest') {
        pipeline.push({ $sort: { createdAt: -1 } });
      } else {
        // default when coordinates present: nearest first
        pipeline.push({ $sort: { distanceMeters: 1 } });
      }

      pipeline.push({ $skip: skip }, { $limit: limitNum });

      items = await Equipment.aggregate(pipeline);

      // Total count with same geo query
      const countPipeline = [
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
        { $count: 'total' },
      ];
      const countResult = await Equipment.aggregate(countPipeline);
      total = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      // 2. Standard Non-Geospatial Query
      let sortQuery = { createdAt: -1 };
      if (sortBy === 'price_asc') sortQuery = { dailyRate: 1 };
      if (sortBy === 'price_desc') sortQuery = { dailyRate: -1 };

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

