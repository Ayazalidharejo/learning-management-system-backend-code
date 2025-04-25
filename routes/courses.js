// routes/courses.js
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
  getCourses,
  createCourse,
  enrollStudent,
  unenrollStudent
} = require('../controllers/courseController');

// @route   GET /api/courses
// @desc    Get courses (all for admin, enrolled for student)
// @access  Private
router.get('/', auth, getCourses);

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private/Admin/SuperAdmin
router.post('/', [auth, checkRole(['admin', 'superadmin'])], createCourse);

// @route   POST /api/courses/:courseId/enroll/:userId
// @desc    Enroll a student in a course
// @access  Private/Admin/SuperAdmin
router.post('/:courseId/enroll/:userId', 
  [auth, checkRole(['admin', 'superadmin'])], 
  enrollStudent
);

// @route   POST /api/courses/:courseId/unenroll/:userId
// @desc    Unenroll a student from a course
// @access  Private/Admin/SuperAdmin
router.post('/:courseId/unenroll/:userId', 
  [auth, checkRole(['admin', 'superadmin'])], 
  unenrollStudent
);

module.exports = router;