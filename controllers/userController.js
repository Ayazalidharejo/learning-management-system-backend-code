// controllers/userController.js
const User = require('../models/User');
const Course = require('../models/Course');

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    // Fix for the "null user found" error - Add logging
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Debug log to check if any users are null
    users.forEach(user => {
      if (!user) {
        console.log('null user found in getAllUsers');
      }
    });
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching all users:', err.message);
    res.status(500).send('Server error');
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userIdToDelete);

    if (!deletedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Unenroll user from courses upon deletion
    await Course.updateMany(
      { students: userIdToDelete },
      { $pull: { students: userIdToDelete } }
    );

    console.log(`User deleted successfully: ${deletedUser.email} (ID: ${userIdToDelete}) by ${req.user.email}`);
    res.json({ msg: 'User removed successfully' });

  } catch (err) {
    console.error('Error deleting user:', err.message);
    // Handle potential CastError if the ID format is invalid
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }
    res.status(500).send('Server error');
  }
};