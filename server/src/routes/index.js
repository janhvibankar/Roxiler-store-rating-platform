const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const storeRoutes = require('./storeRoutes');
const ratingRoutes = require('./ratingRoutes');
const adminRoutes = require('./adminRoutes');
const ownerRoutes = require('./ownerRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stores', storeRoutes);
router.use('/ratings', ratingRoutes);
router.use('/admin', adminRoutes);
router.use('/owner', ownerRoutes);

module.exports = router;
