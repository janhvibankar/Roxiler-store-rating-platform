const express = require('express');
const router = express.Router();
const storeOwnerController = require('../controllers/storeOwnerController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireStoreOwner } = require('../middleware/roleMiddleware');
const { verifyStoreOwnership } = require('../middleware/ownershipMiddleware');

// All routes require JWT and STORE_OWNER role
router.use(authenticateToken, requireStoreOwner);

// Owner Dashboard (returns owned stores with dynamic average rating)
router.get('/dashboard', storeOwnerController.getOwnerDashboard);

// Owner Rating Users Listing (requires store ownership verification)
router.get('/stores/:storeId/ratings', verifyStoreOwnership, storeOwnerController.getStoreRatingUsers);

module.exports = router;
