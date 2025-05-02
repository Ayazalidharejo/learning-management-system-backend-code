// routes/auth.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  verifyResetToken,
  resetPassword
} = require('../controllers/authController');


router.post('/register', register);


router.post('/login', login);

router.get('/me', auth, getCurrentUser);


router.post('/forgot-password', forgotPassword);


router.get('/verify-reset-token/:token', verifyResetToken);


router.post('/reset-password/:token', resetPassword);

// module.exports = router;






// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/current
// @desc    Get current user
// @access  Private
router.get('/current', auth, authController.getCurrentUser);

// CRITICAL: Make sure these routes match exactly what your frontend is calling
// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   GET api/auth/verify-reset-token/:token
// @desc    Verify password reset token
// @access  Public
router.get('/verify-reset-token/:token', authController.verifyResetToken);

// @route   POST api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;