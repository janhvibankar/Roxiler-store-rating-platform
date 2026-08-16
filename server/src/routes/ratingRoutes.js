const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireUser } = require('../middleware/roleMiddleware');

router.get('/', ratingController.getAllRatings);
router.post('/', authenticateToken, requireUser, ratingController.submitRating);
router.patch('/:storeId', authenticateToken, requireUser, ratingController.updateRating);
router.put('/:storeId', authenticateToken, requireUser, ratingController.updateRating);

module.exports = router;
