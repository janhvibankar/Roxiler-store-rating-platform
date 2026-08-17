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

  async getStoreRatingUsers(storeId, filters = {}) {
    if (!storeId) {
      const err = new Error('Store ID is required.');
      err.statusCode = 400;
      throw err;
    }
    const allowedSortBy = ['name', 'email', 'address', 'rating', 'created_at', 'updated_at'];
    const allowedSortOrder = ['asc', 'desc', 'ASC', 'DESC'];

    if (filters.sortBy && !allowedSortBy.includes(filters.sortBy)) {
      const err = new Error(`Invalid sortBy parameter '${filters.sortBy}'. Allowed values are: ${allowedSortBy.join(', ')}.`);
      err.statusCode = 400;
      throw err;
    }

    if (filters.sortOrder && !allowedSortOrder.includes(filters.sortOrder)) {
      const err = new Error(`Invalid sortOrder parameter '${filters.sortOrder}'. Allowed values are 'asc' or 'desc'.`);
      err.statusCode = 400;
      throw err;
    }

    return ratingRepository.getRatingUsersForStore(storeId, filters);
  }
}

module.exports = new StoreOwnerService();
