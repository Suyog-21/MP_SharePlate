const User = require('../models/User');

const isAuthenticated = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user || !user.isActive) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'User account not found or deactivated.' });
    }
    req.currentUser = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify session' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Support role aliases, e.g. 'donor' or 'restaurant'
    const userRole = req.currentUser.role;
    const isAllowed = roles.includes(userRole) || 
      (roles.includes('donor') && userRole === 'restaurant') ||
      (roles.includes('restaurant') && userRole === 'donor');

    if (!isAllowed) {
      return res.status(403).json({ error: `Access denied. Requires one of roles: ${roles.join(', ')}` });
    }
    next();
  };
};

module.exports = {
  isAuthenticated,
  requireRole,
};
