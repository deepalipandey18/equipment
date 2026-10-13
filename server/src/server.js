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

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[EquipmentHub Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION] Shutting down server...', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

