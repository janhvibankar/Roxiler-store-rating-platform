const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responseHandler');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return sendError(res, 401, 'Authentication token required');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return sendError(res, 401, 'Format must be: Bearer <token>');
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_store_rating_platform_2026');
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Authentication token has expired');
    }
    return sendError(res, 401, 'Invalid authentication token');
  }
};

const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_store_rating_platform_2026');
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch (error) {
    // Ignore optional token errors
  }
  next();
};

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
};
