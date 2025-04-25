// routes/users.js
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { getAllUsers, deleteUser } = require('../controllers/userController');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin/SuperAdmin
router.get('/', [auth, checkRole(['admin', 'superadmin'])], getAllUsers);

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin/SuperAdmin
router.delete('/:id', [auth, checkRole(['admin', 'superadmin'])], deleteUser);

module.exports = router;