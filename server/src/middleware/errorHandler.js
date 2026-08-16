const { sendError } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error('Centralized Error Handler caught an error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, statusCode, message, err.errors || null);
};

module.exports = errorHandler;
