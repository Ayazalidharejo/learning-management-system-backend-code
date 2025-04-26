// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET 

exports.auth = async (req, res, next) => {
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Add user from payload to request object
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      // If user associated with token no longer exists
      return res.status(401).json({ msg: 'Token is not valid, user not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

exports.checkRole = (allowedRoles) => (req, res, next) => {
  // Ensure auth middleware ran first and attached req.user
  if (!req.user || !req.user.role) {
    return res.status(401).json({ msg: 'Authentication required' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      msg: 'Access denied. You do not have the required permissions.' 
    });
  }
  next();
};