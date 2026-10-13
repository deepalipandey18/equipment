const EquipmentCategory = require('../models/EquipmentCategory');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await EquipmentCategory.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

