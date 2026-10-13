const { z } = require('zod');

const createBookingSchema = z.object({
  equipmentId: z.string({ required_error: 'Equipment ID is required' }).min(1),
  startDate: z.string({ required_error: 'Start date is required' }),
  endDate: z.string({ required_error: 'End date is required' }),
  operatorRequested: z.boolean().default(false),
  deliveryAddress: z
    .object({
      street: z.string().optional().default(''),
      city: z.string().optional().default(''),
      state: z.string().optional().default(''),
      pincode: z.string().optional().default(''),
      notes: z.string().optional().default(''),
    })
    .optional(),
});

const respondBookingSchema = z.object({
  action: z.enum(['accept', 'reject'], {
    required_error: 'Action must be either "accept" or "reject"',
  }),
  rejectionReason: z.string().optional().default(''),
});

const progressBookingSchema = z.object({
  status: z.enum(['Ongoing', 'Completed'], {
    required_error: 'Status must be either "Ongoing" (handover) or "Completed" (return)',
  }),
  meterHours: z.coerce.number().optional().default(0),
  notes: z.string().optional().default(''),
});

const cancelBookingSchema = z.object({
  reason: z.string().optional().default('Cancelled by user'),
});

module.exports = {
  createBookingSchema,
  respondBookingSchema,
  progressBookingSchema,
  cancelBookingSchema,
};

