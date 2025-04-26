// routes/users.js
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { getAllUsers, deleteUser } = require('../controllers/userController');


router.get('/', [auth, checkRole(['admin', 'superadmin'])], getAllUsers);


router.delete('/:id', [auth, checkRole(['admin', 'superadmin'])], deleteUser);

module.exports = router;