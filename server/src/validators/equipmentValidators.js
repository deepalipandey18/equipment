const { z } = require('zod');

const createEquipmentSchema = z.object({
  name: z
    .string({ required_error: 'Equipment name is required' })
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(120, 'Name cannot exceed 120 characters'),
  categoryId: z.string({ required_error: 'Category is required' }).min(1),
  brand: z.string({ required_error: 'Brand is required' }).trim().min(1),
  model: z.string({ required_error: 'Model is required' }).trim().min(1),
  year: z.coerce.number().min(1980).max(new Date().getFullYear() + 1).optional(),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(20, 'Description must be at least 20 characters'),
  condition: z.enum(['excellent', 'good', 'fair']).default('good'),
  photos: z
    .array(z.string().min(1, 'Photo path or URL is required'))
    .min(1, 'Please provide at least one photo'),
  videoUrl: z.string().optional().default(''),

  // Marketplace Listing Mode (Rent vs OLX Sell)
  listingType: z.enum(['rent', 'sale', 'both']).default('rent'),
  salePrice: z.coerce.number().min(0).default(0),
  isNegotiable: z.boolean().default(true),
  usageHours: z.coerce.number().min(0).default(0),
  ownershipType: z.enum(['first_owner', 'second_owner', 'third_or_more']).default('first_owner'),
  rcAvailable: z.boolean().default(true),
  nocAvailable: z.boolean().default(true),
  sellerContactPhone: z.string().optional().default(''),
  sellerWhatsApp: z.string().optional().default(''),

  // Document verification for Verified Owner badge
  verificationDocumentUrl: z.string().optional().default(''),

  // Rates in rupees (for rental or both)
  hourlyRate: z.coerce.number().min(0).default(0),
  dailyRate: z.coerce.number().min(0).default(0),
  monthlyRate: z.coerce.number().min(0).default(0),
  minRentalDurationDays: z.coerce.number().min(1).default(1),
  securityDeposit: z.coerce.number().min(0).default(0),
  deliveryCharges: z.coerce.number().min(0).default(0),
  operatorOption: z.enum(['included', 'optional', 'not_included']).default('optional'),
  overtimeHourlyRate: z.coerce.number().min(0).default(0),

  // Coordinates [longitude, latitude]
  coordinates: z
    .array(z.coerce.number())
    .length(2, 'Coordinates must be an array of [longitude, latitude]')
    .refine(([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90, {
      message: 'Invalid coordinate values: longitude must be [-180, 180] and latitude [-90, 90]',
    }),

  // Address
  address: z.object({
    street: z.string().optional().default(''),
    area: z.string().optional().default(''),
    city: z.string({ required_error: 'City is required' }).trim().min(1),
    state: z.string({ required_error: 'State is required' }).trim().min(1),
    pincode: z.string({ required_error: 'Pincode is required' }).trim().min(1),
    landmark: z.string().optional().default(''),
  }),
  locationSource: z.enum(['gps', 'map_selection', 'manual']).default('gps'),
  deliveryRadiusKm: z.coerce.number().min(1).default(50),
  serialNumber: z.string().optional().default(''),
});

const updateEquipmentSchema = createEquipmentSchema.partial();

module.exports = {
  createEquipmentSchema,
  updateEquipmentSchema,
};
