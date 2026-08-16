const storeRepository = require('../repositories/storeRepository');
const ratingRepository = require('../repositories/ratingRepository');

class StoreOwnerService {
  async getOwnerDashboard(ownerId) {
    if (!ownerId) {
      const err = new Error('Owner ID is required.');
      err.statusCode = 400;
      throw err;
    }
    return storeRepository.findStoresByOwnerId(ownerId);
  }

  async getStoreRatingUsers(storeId) {
    if (!storeId) {
      const err = new Error('Store ID is required.');
      err.statusCode = 400;
      throw err;
    }
    return ratingRepository.getRatingUsersForStore(storeId);
  }
}

module.exports = new StoreOwnerService();
