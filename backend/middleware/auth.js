const { jwtHelpers, errorHelpers } = require('../shared');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = jwtHelpers.extractToken(authHeader);

  if (!token) {
    return res.status(401).json(errorHelpers.authError('Access token required'));
  }

  try {
    const decoded = jwtHelpers.verifyToken(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(errorHelpers.authError('Invalid or expired token'));
  }
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(errorHelpers.authError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          statusCode: 403,
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
};

// Admin only middleware
const requireAdmin = authorizeRole(['admin']);

// Staff or admin middleware
const requireStaff = authorizeRole(['admin', 'staff']);

module.exports = {
  authenticateToken,
  authorizeRole,
  requireAdmin,
  requireStaff,
}; 