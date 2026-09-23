// Middleware to verify admin privileges
const adminProtect = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Admin access privileges required'
  });
};

module.exports = { adminProtect };
