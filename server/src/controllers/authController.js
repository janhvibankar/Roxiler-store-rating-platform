const authService = require('../services/authService');
const { sendSuccess } = require('../utils/responseHandler');

const signup = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    return sendSuccess(res, 201, 'User registered successfully', user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId);
    return sendSuccess(res, 200, 'Current user profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.userId, req.body);
    return sendSuccess(res, 200, 'Password updated successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getCurrentUser,
  changePassword,
};
