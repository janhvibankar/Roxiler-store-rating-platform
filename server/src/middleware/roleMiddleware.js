const { sendError } = require('../utils/responseHandler');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    const userRole = req.user.role;
    const rolesArray = Array.isArray(allowedRoles[0]) ? allowedRoles[0] : allowedRoles;

    if (!rolesArray.includes(userRole)) {
      return sendError(res, 403, 'Access denied. You do not have permission to perform this action.');
    }

    next();
  };
};

const requireAdmin = requireRole('ADMIN');
const requireUser = requireRole('USER');
const requireStoreOwner = requireRole('STORE_OWNER');

module.exports = {
  requireRole,
  requireAdmin,
  requireUser,
  requireStoreOwner,
};
