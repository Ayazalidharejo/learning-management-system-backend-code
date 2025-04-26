// controllers/superadminController.js
const User = require('../models/User');
const Course = require('../models/Course');

// Remove Admin
exports.removeAdmin = async (req, res) => {
  try {
    const adminIdToRemove = req.params.id;
    
    // Find the user to check if it's really an admin
    const adminUser = await User.findById(adminIdToRemove);
    
    if (!adminUser) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if the user is actually an admin
    if (adminUser.role !== 'admin') {
      return res.status(400).json({ msg: 'Selected user is not an admin' });
    }
    
    // Prevent superadmins from removing other superadmins
    if (adminUser.role === 'superadmin') {
      return res.status(403).json({ msg: 'Cannot remove a superadmin' });
    }
    
    // Check that caller isn't trying to remove themselves
    if (adminUser._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ msg: 'You cannot remove yourself' });
    }
    
    // Either delete the admin user completely or just downgrade to student
    if (req.query.delete === 'true') {
      // Delete the admin completely
      const deletedAdmin = await User.findByIdAndDelete(adminIdToRemove);
      
      if (!deletedAdmin) {
        return res.status(404).json({ msg: 'Admin not found' });
      }
      
      // Unenroll user from courses upon deletion
      await Course.updateMany(
        { students: adminIdToRemove },
        { $pull: { students: adminIdToRemove } }
      );
      
      console.log(`Admin deleted successfully: ${deletedAdmin.email} (ID: ${adminIdToRemove}) by superadmin ${req.user.email}`);
      res.json({ msg: 'Admin removed and deleted successfully' });
    } else {
      // Just downgrade the admin to student role
      adminUser.role = 'student';
      await adminUser.save();
      
      console.log(`Admin downgraded to student: ${adminUser.email} (ID: ${adminIdToRemove}) by superadmin ${req.user.email}`);
      res.json({ msg: 'Admin downgraded to student successfully' });
    }
  } catch (err) {
    console.error('Error removing admin:', err.message);
    // Handle potential CastError if the ID format is invalid
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }
    res.status(500).send('Server error');
  }
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error('Error fetching all admins:', err.message);
    res.status(500).send('Server error');
  }
};

// Create a new route file for superadmin routes
// routes/superadmin.js
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { removeAdmin, getAllAdmins } = require('../controllers/superadminController');


router.get('/admins', [auth, checkRole(['superadmin'])], getAllAdmins);


router.delete('/admins/:id', [auth, checkRole(['superadmin'])], removeAdmin);

module.exports = router;