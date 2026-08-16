const storeOwnerService = require('../services/storeOwnerService');
const { sendSuccess } = require('../utils/responseHandler');

const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const stores = await storeOwnerService.getOwnerDashboard(ownerId);
    return sendSuccess(res, 200, 'Store owner dashboard details retrieved successfully', stores);
  } catch (error) {
    next(error);
  }
};

const getStoreRatingUsers = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.params.id;
    const ratings = await storeOwnerService.getStoreRatingUsers(storeId);
    return sendSuccess(res, 200, 'Store rating users retrieved successfully', ratings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOwnerDashboard,
  getStoreRatingUsers,
};
