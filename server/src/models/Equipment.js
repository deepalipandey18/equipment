const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EquipmentCategory',
      required: [true, 'Machinery category is required'],
      index: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required (e.g. JCB, Caterpillar, Kirloskar)'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required (e.g. 3DX Super, PC210)'],
      trim: true,
    },
    year: {
      type: Number,
      min: [1980, 'Manufacturing year cannot be before 1980'],
      max: [new Date().getFullYear() + 1, 'Manufacturing year cannot be in the future'],
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters long'],
    },
    condition: {
      type: String,
      enum: ['brand_new', 'excellent', 'good', 'fair'],
      default: 'good',
    },
    photos: {
      type: [String],
      default: [
        '/images/illustrations/jcb-excavator.svg',
      ],
      validate: [
        (val) => val.length > 0,
        'Please provide at least one photo of the machinery',
      ],
    },
    videoUrl: {
      type: String,
      default: '',
    },

    // OLX-Style Listing Intent (Rent, Sell, or Both)
    listingType: {
      type: String,
      enum: ['rent', 'sale', 'both'],
      default: 'rent',
      index: true,
    },

    // Sale Pricing & OLX Machine Details
    salePrice: {
      type: Number,
      default: 0,
      min: [0, 'Sale price cannot be negative'],
    },
    isNegotiable: {
      type: Boolean,
      default: true,
    },
    usageHours: {
      type: Number,
      default: 0,
      min: [0, 'Operating hours cannot be negative'],
    },
    ownershipType: {
      type: String,
      enum: ['first_owner', 'second_owner', 'third_or_more'],
      default: 'first_owner',
    },
    rcAvailable: {
      type: Boolean,
      default: true,
    },
    nocAvailable: {
      type: Boolean,
      default: true,
    },
    sellerContactPhone: {
      type: String,
      default: '',
      trim: true,
    },
    sellerWhatsApp: {
      type: String,
      default: '',
      trim: true,
    },
    soldOut: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Rental Rates (in rupees)
    hourlyRate: {
      type: Number,
      default: 0,
      min: [0, 'Hourly rate cannot be negative'],
    },
    dailyRate: {
      type: Number,
      default: 0,
      min: [0, 'Daily rate cannot be negative'],
    },
    monthlyRate: {
      type: Number,
      default: 0,
      min: [0, 'Monthly rate cannot be negative'],
    },
    minRentalDurationDays: {
      type: Number,
      default: 1,
      min: [1, 'Minimum rental duration must be at least 1 day'],
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Security deposit cannot be negative'],
    },
    deliveryCharges: {
      type: Number,
      default: 0,
      min: [0, 'Delivery charges cannot be negative'],
    },
    operatorOption: {
      type: String,
      enum: ['included', 'optional', 'not_included'],
      default: 'optional',
    },
    overtimeHourlyRate: {
      type: Number,
      default: 0,
    },

    // GeoJSON Point location for 2dsphere indexing
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      // Note: MongoDB GeoJSON coordinates format is strictly [longitude, latitude]
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates [longitude, latitude] are required'],
        validate: {
          validator: function (coords) {
            return (
              Array.isArray(coords) &&
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 && // longitude
              coords[1] >= -90 &&
              coords[1] <= 90 // latitude
            );
          },
          message: 'Invalid GeoJSON coordinates: must be [longitude, latitude]',
        },
      },
    },

    // Detailed address
    address: {
      street: { type: String, default: '' },
      area: { type: String, default: '' },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, required: [true, 'State is required'], trim: true },
      pincode: { type: String, required: [true, 'Postal code is required'], trim: true },
      landmark: { type: String, default: '' },
    },
    locationSource: {
      type: String,
      enum: ['gps', 'map_selection', 'manual'],
      default: 'gps',
    },
    deliveryRadiusKm: {
      type: Number,
      default: 50,
      min: [1, 'Delivery radius must be at least 1 km'],
    },

    // Ownership & Compliance Documents
    serialNumber: {
      type: String,
      default: '',
      trim: true,
    },
    verificationDocuments: [
      {
        documentType: {
          type: String,
          enum: ['rc_copy', 'insurance', 'pollution_puc', 'fitness_certificate', 'invoice'],
        },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Approval & Listing Lifecycles
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // default approved for ease of testing; admin can review
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    listingStatus: {
      type: String,
      enum: ['active', 'paused', 'maintenance', 'deleted'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for MongoDB geospatial queries ($near, $geoNear)
equipmentSchema.index({ location: '2dsphere' });
equipmentSchema.index({ categoryId: 1, approvalStatus: 1, listingStatus: 1 });
equipmentSchema.index({ listingType: 1, approvalStatus: 1, listingStatus: 1 });
equipmentSchema.index({ dailyRate: 1 });
equipmentSchema.index({ salePrice: 1 });

const Equipment = mongoose.model('Equipment', equipmentSchema);
module.exports = Equipment;
