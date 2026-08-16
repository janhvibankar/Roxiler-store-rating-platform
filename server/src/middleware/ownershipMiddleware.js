const storeRepository = require('../repositories/storeRepository');
const { sendError } = require('../utils/responseHandler');

const verifyStoreOwnership = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, 401, 'Authentication required');
    }

    const storeId = req.params.storeId || req.params.id || req.body.store_id;
    if (!storeId) {
      return sendError(res, 400, 'Store ID parameter is required.');
    }

    const store = await storeRepository.findStoreById(storeId);
    if (!store) {
      return sendError(res, 404, 'Store not found.');
    }

    if (store.owner_id !== req.user.userId) {
      return sendError(res, 403, 'Access denied. You do not own this store.');
    }

    req.store = store;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyStoreOwnership,
};
