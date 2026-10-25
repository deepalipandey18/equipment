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

exports.getCategories = async (req, res, next) => {
  try {
    let categories = await EquipmentCategory.find({ isActive: true }).sort({ name: 1 });
    if (categories.length === 0) {
      for (const cat of GUIDELINE_CATEGORIES) {
        await EquipmentCategory.findOneAndUpdate(
          { slug: cat.slug },
          { $setOnInsert: cat },
          { upsert: true, new: true }
        );
      }
      categories = await EquipmentCategory.find({ isActive: true }).sort({ name: 1 });
    }
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
