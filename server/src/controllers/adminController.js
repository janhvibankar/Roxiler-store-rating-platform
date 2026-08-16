const adminService = require('../services/adminService');
const userRepository = require('../repositories/userRepository');
const { sendSuccess } = require('../utils/responseHandler');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, 200, 'Admin dashboard statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUserByAdmin(req.body);
    return sendSuccess(res, 201, 'User created by admin successfully', user);
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  try {
    const store = await adminService.createStoreByAdmin(req.body);
    return sendSuccess(res, 201, 'Store created by admin successfully', store);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getUsersListing(req.query);
    return sendSuccess(res, 200, 'Admin users listing retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

const getStores = async (req, res, next) => {
  try {
    const stores = await adminService.getStoresListing(req.query);
    return sendSuccess(res, 200, 'Admin stores listing retrieved successfully', stores);
  } catch (error) {
    next(error);
  }
};

const getUserDetails = async (req, res, next) => {
  try {
    const userDetails = await adminService.getUserDetails(req.params.id);
    return sendSuccess(res, 200, 'User details retrieved successfully', userDetails);
  } catch (error) {
    next(error);
  }
};

const getStoreOwners = async (req, res, next) => {
  try {
    const owners = await userRepository.getStoreOwnerUsers();
    return sendSuccess(res, 200, 'Store owners list retrieved successfully', owners);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getStores,
  getUserDetails,
  getStoreOwners,
};
