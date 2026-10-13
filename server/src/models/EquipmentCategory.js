const mongoose = require('mongoose');

const equipmentCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    iconName: {
      type: String,
      default: 'Wrench', // Lucide icon identifier
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const EquipmentCategory = mongoose.model('EquipmentCategory', equipmentCategorySchema);
module.exports = EquipmentCategory;

