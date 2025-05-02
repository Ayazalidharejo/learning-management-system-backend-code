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

module.exports = router;