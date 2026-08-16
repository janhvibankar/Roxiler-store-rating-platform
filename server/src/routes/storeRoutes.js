const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin, requireStoreOwner } = require('../middleware/roleMiddleware');
const { verifyStoreOwnership } = require('../middleware/ownershipMiddleware');

// Route to get stores with user-specific rating calculation and name/address search
router.get('/', optionalAuthenticateToken, storeController.getUserStores);

// Admin-only route to create stores
router.post('/', authenticateToken, requireAdmin, storeController.createStore);

// Store Owner-only route to view owner dashboard with ownership check
router.get('/:id/owner-dashboard', authenticateToken, requireStoreOwner, verifyStoreOwnership, storeController.getStoreOwnerDashboard);

module.exports = router;
