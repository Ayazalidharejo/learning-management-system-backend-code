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


router.get('/', auth, getCourses);


router.post('/', [auth, checkRole(['admin', 'superadmin'])], createCourse);


router.post('/:courseId/enroll/:userId', 
  [auth, checkRole(['admin', 'superadmin'])], 
  enrollStudent
);


router.post('/:courseId/unenroll/:userId', 
  [auth, checkRole(['admin', 'superadmin'])], 
  unenrollStudent
);

module.exports = router;