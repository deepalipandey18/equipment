const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { protect } = require('../middleware/authMiddleware');
const { verifySubscriptionQuota } = require('../middleware/subscriptionGate');

// Public: Marketplace Search with 2dsphere Nearby Radar & Filters
router.get('/', equipmentController.searchMarketplace);

// Protected: Get owner's own equipment listings (supports /my and /my-equipment)
router.get('/my', protect, equipmentController.getMyEquipment);
router.get('/my-equipment', protect, equipmentController.getMyEquipment);

// Protected: Register new equipment (Strictly gated by Subscription and Quota!)
router.post('/', protect, verifySubscriptionQuota, equipmentController.createEquipment);

// Get equipment details by ID
router.get('/:id', equipmentController.getEquipmentById);

// Protected: Update equipment details (Enforces ownership)
router.put('/:id', protect, equipmentController.updateEquipment);

// Protected: Toggle status (active/paused)
router.patch('/:id/status', protect, equipmentController.toggleStatus);

// Protected: Delete equipment listing (Enforces ownership)
router.delete('/:id', protect, equipmentController.deleteEquipment);

module.exports = router;

