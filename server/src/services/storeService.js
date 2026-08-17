const storeRepository = require('../repositories/storeRepository');
const userRepository = require('../repositories/userRepository');
const {
  validateName,
  validateAddress,
  validateEmail,
} = require('../utils/validators');

class StoreService {
  async createStore({ name, email, address, owner_id }) {
    const errors = {};

    const nameVal = validateName(name, 'Store Name');
    if (!nameVal.isValid) errors.name = nameVal.message;

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) errors.email = emailVal.message;

    const addrVal = validateAddress(address, 'Address');
    if (!addrVal.isValid) errors.address = addrVal.message;

    if (!owner_id) {
      errors.owner_id = 'Owner ID is required.';
    }

    if (Object.keys(errors).length > 0) {
      const err = new Error(errors[Object.keys(errors)[0]] || 'Validation failed');
      err.statusCode = 400;
      err.errors = errors;
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

    return storeRepository.createStore({
      name: nameVal.value,
      email: emailVal.value,
      address: addrVal.value,
      owner_id,
    });
  }

  async getStoreById(id) {
    return storeRepository.findStoreById(id);
  }

  async getAllStores() {
    return storeRepository.getStoresWithAverageRating();
  }

  async getStoresForUser(filters = {}) {
    const allowedSortBy = ['name', 'address', 'overallRating'];
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

    return storeRepository.getStoresForUser(filters);
  }
}

module.exports = new StoreService();
