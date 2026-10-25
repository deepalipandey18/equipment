const dotenv = require('dotenv');
// Load environment variables before anything else
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION] Shutting down server...', err.name, err.message);
  process.exit(1);
});

// Connect to Database and auto-seed if empty
connectDB().then(async () => {
  try {
    const Equipment = require('./models/Equipment');
    const count = await Equipment.countDocuments();
    if (count === 0) {
      console.log('[Auto-Seed] Empty database detected. Populating sample data across all tables...');
      const seedAll = require('../scripts/seedAll');
      await seedAll(false);
    } else {
      // Ensure marketplace sync for rent & buy equipment
      const equipmentService = require('./services/equipmentService');
      await equipmentService.ensureMarketplaceData();
    }
  } catch (err) {
    console.warn('[Auto-Seed Warning] Could not auto-seed data:', err.message);
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[STORENT Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION] Shutting down server...', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
