const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// All Admin routes require valid JWT AND ADMIN role
router.use(authenticateToken, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.post('/users', adminController.createUser);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.post('/stores', adminController.createStore);
router.get('/stores', adminController.getStores);
router.get('/store-owners', adminController.getStoreOwners);

module.exports = router;
