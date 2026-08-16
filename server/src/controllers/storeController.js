const storeService = require('../services/storeService');
const ratingService = require('../services/ratingService');
const { sendSuccess } = require('../utils/responseHandler');

const getAllStores = async (req, res, next) => {
  try {
    const stores = await storeService.getAllStores();
    return sendSuccess(res, 200, 'Stores retrieved successfully', stores);
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  try {
    const store = await storeService.createStore(req.body);
    return sendSuccess(res, 201, 'Store created successfully', store);
  } catch (error) {
    next(error);
  }
};

const getStoreOwnerDashboard = async (req, res, next) => {
  try {
    const store = req.store;
    const ratings = await ratingService.getRatingsForStore(store.id);

    return sendSuccess(res, 200, 'Store owner dashboard details retrieved', {
      store,
      ratings,
    });
  } catch (error) {
    next(error);
  }
};

const getUserStores = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.userId : null;
    const { name, address, sortBy, sortOrder } = req.query;
    const stores = await storeService.getStoresForUser({ name, address, userId, sortBy, sortOrder });
    return sendSuccess(res, 200, 'User stores listing retrieved successfully', stores);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStores,
  getUserStores,
  createStore,
  getStoreOwnerDashboard,
};
