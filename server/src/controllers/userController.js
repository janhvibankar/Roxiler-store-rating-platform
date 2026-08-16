const userService = require('../services/userService');
const { sendSuccess } = require('../utils/responseHandler');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return sendSuccess(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return sendSuccess(res, 201, 'User created successfully', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
};
