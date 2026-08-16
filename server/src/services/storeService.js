const storeRepository = require('../repositories/storeRepository');
const userRepository = require('../repositories/userRepository');

class StoreService {
  async createStore({ name, email, address, owner_id }) {
    if (!name || !email || !address || !owner_id) {
      const err = new Error('All store fields (name, email, address, owner_id) are required.');
      err.statusCode = 400;
      throw err;
    }

    const owner = await userRepository.findUserById(owner_id);
    if (!owner) {
      const err = new Error(`User with ID ${owner_id} does not exist.`);
      err.statusCode = 400;
      throw err;
    }

    if (owner.role !== 'STORE_OWNER') {
      const err = new Error(`Assigned store owner must have role 'STORE_OWNER'. User ${owner.name} has role '${owner.role}'.`);
      err.statusCode = 400;
      throw err;
    }

    return storeRepository.createStore({ name, email, address, owner_id });
  }

  async getStoreById(id) {
    return storeRepository.findStoreById(id);
  }

  async getAllStores() {
    return storeRepository.getStoresWithAverageRating();
  }

  async getStoresForUser(filters = {}) {
    return storeRepository.getStoresForUser(filters);
  }
}

module.exports = new StoreService();
