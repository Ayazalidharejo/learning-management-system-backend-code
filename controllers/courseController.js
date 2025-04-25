// controllers/courseController.js
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get Courses
exports.getCourses = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      // Students see only their enrolled courses
      const userWithCourses = await User.findById(req.user.id).populate({
        path: 'enrolledCourses',
        select: 'name description'
      });
      
      if (!userWithCourses) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      res.json(userWithCourses.enrolledCourses || []);
    } else {
      // Admins/Superadmins see all courses and students
      const courses = await Course.find().populate({
        path: 'students',
        select: 'name email role'
      });
      res.json(courses);
    }
  } catch (err) {
    console.error('Error fetching courses:', err.message);
    res.status(500).send('Server error');
  }
};

// Create Course
exports.createCourse = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ msg: 'Course name is required' });
  }

  try {
    const newCourse = new Course({
      name,
      description
    });
    await newCourse.save();
    console.log(`Course created: ${newCourse.name} (ID: ${newCourse.id}) by ${req.user.email}`);
    res.status(201).json(newCourse);
  } catch (err) {
    console.error('Error creating course:', err.message);
    res.status(500).send('Server error');
  }
};

// Enroll Student
exports.enrollStudent = async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid Course or User ID format' });
    }

    // Find course and user concurrently
    const [course, user] = await Promise.all([
      Course.findById(courseId),
      User.findById(userId)
    ]);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if the user is a student
    if (user.role !== 'student') {
      return res.status(400).json({ msg: 'Only users with the role "student" can be enrolled in courses' });
    }

    let updated = false;

    // Add user to course's students list (if not already present)
    if (!course.students.some(studentId => studentId.toString() === user._id.toString())) {
      course.students.push(user._id);
      updated = true;
    }

    // Add course to user's enrolledCourses list (if not already present)
    if (!user.enrolledCourses.some(enrolledCourseId => enrolledCourseId.toString() === course._id.toString())) {
      user.enrolledCourses.push(course._id);
      updated = true;
    }

    if (updated) {
      await Promise.all([course.save(), user.save()]);
      console.log(`Student ${user.email} enrolled in course ${course.name} by ${req.user.email}`);
      res.json({ msg: 'Student enrolled successfully' });
    } else {
      res.json({ msg: 'Student was already enrolled in this course' });
    }

  } catch (err) {
    console.error('Error enrolling student:', err.message);
    res.status(500).send('Server error');
  }
};

// Unenroll Student
exports.unenrollStudent = async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid Course or User ID format' });
    }

    const [course, user] = await Promise.all([
      Course.findById(courseId),
      User.findById(userId)
    ]);

    if (!course) return res.status(404).json({ msg: 'Course not found' });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    let updated = false;

    // Remove user from course's students list
    const initialStudentCount = course.students.length;
    course.students = course.students.filter(studentId => studentId.toString() !== user._id.toString());
    if(course.students.length < initialStudentCount) updated = true;

    // Remove course from user's enrolledCourses list
    const initialCourseCount = user.enrolledCourses.length;
    user.enrolledCourses = user.enrolledCourses.filter(enrolledCourseId => enrolledCourseId.toString() !== course._id.toString());
    if(user.enrolledCourses.length < initialCourseCount) updated = true;

    if (updated) {
      await Promise.all([course.save(), user.save()]);
      console.log(`Student ${user.email} unenrolled from course ${course.name} by ${req.user.email}`);
      res.json({ msg: 'Student unenrolled successfully' });
    } else {
      res.json({ msg: 'Student was not enrolled in this course' });
    }

  } catch (err) {
    console.error('Error unenrolling student:', err.message);
    res.status(500).send('Server error');
  }
};