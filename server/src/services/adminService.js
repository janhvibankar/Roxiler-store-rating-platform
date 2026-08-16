const bcrypt = require('bcryptjs');
const db = require('../config/db');
const userRepository = require('../repositories/userRepository');
const storeRepository = require('../repositories/storeRepository');
const ratingRepository = require('../repositories/ratingRepository');
const { validatePassword } = require('../utils/passwordValidator');

class AdminService {
  async createUserByAdmin({ name, email, address, password, role = 'USER' }) {
    if (!name || !email || !address || !password) {
      const err = new Error('All fields (name, email, address, password) are required.');
      err.statusCode = 400;
      throw err;
    }

    const allowedRoles = ['USER', 'ADMIN', 'STORE_OWNER'];
    if (!allowedRoles.includes(role)) {
      const err = new Error(`Admin user creation allows role 'USER', 'ADMIN', or 'STORE_OWNER'. Role '${role}' is not allowed.`);
      err.statusCode = 400;
      throw err;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      const err = new Error(passwordValidation.message);
      err.statusCode = 400;
      throw err;
    }

    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      const err = new Error('Email address is already registered.');
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return userRepository.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      password: hashedPassword,
      role,
    });
  }

  async createStoreByAdmin({ name, email, address, owner_id }) {
    const storeService = require('./storeService');
    return storeService.createStore({ name, email, address, owner_id });
  }

  async getDashboardStats() {
    const userCountResult = await db.query('SELECT COUNT(*) AS count FROM users');
    const storeCountResult = await db.query('SELECT COUNT(*) AS count FROM stores');
    const ratingCountResult = await db.query('SELECT COUNT(*) AS count FROM ratings');

    return {
      totalUsers: userCountResult[0].count,
      totalStores: storeCountResult[0].count,
      totalRatings: ratingCountResult[0].count,
    };
  }

  async getUsersListing(filters = {}) {
    const allowedSortBy = ['name', 'email', 'address', 'role', 'createdAt'];
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

    return userRepository.getAdminUsersListing(filters);
  }

  async getStoresListing(filters = {}) {
    const allowedSortBy = ['name', 'email', 'address', 'createdAt', 'rating'];
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

    return storeRepository.getStoresWithAverageRating(filters);
  }

  async getUserDetails(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const err = new Error(`User with ID ${userId} not found.`);
      err.statusCode = 404;
      throw err;
    }

    let ownedStore = null;
    if (user.role === 'STORE_OWNER') {
      ownedStore = await storeRepository.findStoreByOwnerId(userId);
    }

    return {
      ...user,
      ownedStore,
    };
  }
}

module.exports = new AdminService();
