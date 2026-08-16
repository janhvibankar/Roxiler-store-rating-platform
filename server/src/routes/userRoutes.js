const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireUser } = require('../middleware/roleMiddleware');
const { sendSuccess } = require('../utils/responseHandler');

// User role restricted test endpoint
router.get('/me-test', authenticateToken, requireUser, (req, res) => {
  return sendSuccess(res, 200, 'Normal User restricted access verified', { user: req.user });
});

module.exports = router;
