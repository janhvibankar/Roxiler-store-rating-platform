const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public authentication endpoints
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected authentication endpoints
router.get('/me', authenticateToken, authController.getCurrentUser);
router.patch('/password', authenticateToken, authController.changePassword);

module.exports = router;
