// // Backend code (server.js)
// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const app = express();
// require('dotenv').config();


// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect("mongodb+srv://ayazalixwave:EVn8mkNtKSpyF8C4@cluster0.95kzp.mongodb.net/event_management?retryWrites=true&w=majority",{
//   userNewurlparser: true,
//   useunifiedtopology: true,
// } 
// )
// .then(() => console.log('MongoDB Connected'))
// .catch(err => console.log(err));

// // User Schema
// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   role: {
//     type: String,
//     enum: ['student', 'admin', 'superadmin'],
//     default: 'student'
//   },
//   enrolledCourses: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Course'
//   }],
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Course Schema
// const CourseSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   students: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }]
// });

// // Access Key Schema
// const AccessKeySchema = new mongoose.Schema({
//   key: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'superadmin'],
//     required: true
//   }
// });

// // Models
// const User = mongoose.model('User', UserSchema);
// const Course = mongoose.model('Course', CourseSchema);
// const AccessKey = mongoose.model('AccessKey', AccessKeySchema);

// // Pre-add some access keys for admin and superadmin
// const initializeKeys = async () => {
//   try {
//     const adminKeyExists = await AccessKey.findOne({ role: 'admin' });
//     if (!adminKeyExists) {
//       await AccessKey.create({ key: 'admin123', role: 'admin' });
//       console.log('Admin key created');
//     }
    
//     const superadminKeyExists = await AccessKey.findOne({ role: 'superadmin' });
//     if (!superadminKeyExists) {
//       await AccessKey.create({ key: 'superadmin123', role: 'superadmin' });
//       console.log('Superadmin key created');
//     }
//   } catch (err) {
//     console.error('Error creating initial keys:', err);
//   }
// };

// // Initialize admin keys
// initializeKeys();

// // Auth middleware
// const auth = async (req, res, next) => {
//   try {
//     const token = req.header('x-auth-token');
//     if (!token) {
//       return res.status(401).json({ msg: 'No token, authorization denied' });
//     }

//     const decoded = jwt.verify(token, 'jwtSecret');
//     const user = await User.findById(decoded.user.id).select('-password');
//     if (!user) {
//       return res.status(401).json({ msg: 'Token is not valid' });
//     }
//     req.user = user;
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: 'Token is not valid' });
//   }
// };
// app.get('/test', (req, res) => {
//   res.json({ message: 'Server is working!' });
// });
// // Role-based middleware
// const checkRole = (roles) => (req, res, next) => {
//   if (!roles.includes(req.user.role)) {
//     return res.status(403).json({ msg: 'Access denied' });
//   }
//   next();
// };

// // Register User
// app.post('/api/register', async (req, res) => {
//   console.log('Register API called');
//   const { name, email, password, role, accessKey } = req.body;

//   try {
//     // Check if user already exists
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ msg: 'User already exists' });
//     }

//     // Validate access key for admin and superadmin roles
//     if (role === 'admin' || role === 'superadmin') {
//       if (!accessKey) {
//         return res.status(400).json({ msg: 'Access key is required for this role' });
//       }

//       const validKey = await AccessKey.findOne({ key: accessKey, role });
//       if (!validKey) {
//         return res.status(400).json({ msg: 'Invalid access key' });
//       }
//     }

//     // Create new user
//     user = new User({
//       name,
//       email,
//       password,
//       role
//     });

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);

//     await user.save();

//     // Create and return JWT
//     const payload = {
//       user: {
//         id: user.id,
//         role: user.role
//       }
//     };

//     jwt.sign(
//       payload,
//       'jwtSecret',
//       { expiresIn: 3600 },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token, role: user.role });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Login User
// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if user exists
//     let user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ msg: 'Invalid credentials' });
//     }

//     // Validate password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ msg: 'Invalid credentials' });
//     }

//     // Return JWT
//     const payload = {
//       user: {
//         id: user.id,
//         role: user.role
//       }
//     };

//     jwt.sign(
//       payload,
//       'jwtSecret',
//       { expiresIn: 3600 },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token, role: user.role });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Get current user
// app.get('/api/user', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json(user);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Get all users (admin and superadmin only)
// app.get('/api/users', [auth, checkRole(['admin', 'superadmin'])], async (req, res) => {
//   try {
//     const users = await User.find().select('-password');
//     res.json(users);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Delete user (admin and superadmin only)
// app.delete('/api/users/:id', [auth, checkRole(['admin', 'superadmin'])], async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.json({ msg: 'User removed' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Get student courses
// app.get('/api/courses', auth, async (req, res) => {
//   try {
//     if (req.user.role === 'student') {
//       const user = await User.findById(req.user.id).populate('enrolledCourses');
//       res.json(user.enrolledCourses);
//     } else {
//       const courses = await Course.find().populate('students', '-password');
//       res.json(courses);
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Create a new course (admin and superadmin only)
// app.post('/api/courses', [auth, checkRole(['admin', 'superadmin'])], async (req, res) => {
//   try {
//     const { name, description } = req.body;
//     const course = new Course({
//       name,
//       description
//     });
//     await course.save();
//     res.json(course);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Enroll student in a course (admin and superadmin only)
// app.post('/api/courses/:courseId/enroll/:userId', [auth, checkRole(['admin', 'superadmin'])], async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.courseId);
//     const user = await User.findById(req.params.userId);
    
//     if (!course || !user) {
//       return res.status(404).json({ msg: 'Course or User not found' });
//     }
    
//     if (user.role !== 'student') {
//       return res.status(400).json({ msg: 'Only students can be enrolled in courses' });
//     }
    
//     // Add user to course students
//     if (!course.students.includes(user._id)) {
//       course.students.push(user._id);
//       await course.save();
//     }
    
//     // Add course to user enrolled courses
//     if (!user.enrolledCourses.includes(course._id)) {
//       user.enrolledCourses.push(course._id);
//       await user.save();
//     }
    
//     res.json({ msg: 'Student enrolled successfully' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));















// // Backend code (server.js)
// const express = require('express');
// const mongoose = require('mongoose');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
// const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const app = express();
// require('dotenv').config(); // Make sure you have a .env file for environment variables

// // --- Configuration ---
// // It's better to get sensitive info like DB URI and JWT Secret from environment variables
// const MONGODB_URI = process.env.MONGODB_URI ||"mongodb+srv://ayazalidharejo:ZdS4TYHEKkZiU6vK@cluster0.dgrrlwt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// ;
// const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret'; // CHANGE THIS in your .env file!
// const PORT = process.env.PORT || 5000;


// app.use(cors({origin:["http://localhost:3000"]}));
// // --- Middleware ---
//  // Enable Cross-Origin Resource Sharing for all origins
// app.use(express.json()); // Enable parsing JSON request bodies

// // --- MongoDB Connection ---
// mongoose.connect(MONGODB_URI, {
//     // Corrected options: useNewUrlParser, useUnifiedTopology
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB Connected Successfully'))
// .catch(err => {
//     // Log the specific error for better debugging
//     console.error('MongoDB Connection Error:', err.message);
//     // Optionally exit the process if DB connection fails on startup
//     // process.exit(1);
// });

// // --- Mongoose Schemas ---

// // User Schema
// const UserSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Name is required'] // Added error message
//     },
//     email: {
//         type: String,
//         required: [true, 'Email is required'], // Added error message
//         unique: true,
//         lowercase: true, // Store emails in lowercase
//         match: [/.+\@.+\..+/, 'Please fill a valid email address'] // Basic email format validation
//     },
//     password: {
//         type: String,
//         required: [true, 'Password is required'] // Added error message
//     },
//     role: {
//         type: String,
//         enum: ['student', 'admin', 'superadmin'],
//         default: 'student'
//     },
//     enrolledCourses: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Course'
//     }],
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// // Course Schema
// const CourseSchema = new mongoose.Schema({
//     name: { type: String, required: true }, // Made name required
//     description: String,
//     students: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     }]
// });

// // Access Key Schema
// const AccessKeySchema = new mongoose.Schema({
//     key: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     role: {
//         type: String,
//         enum: ['admin', 'superadmin'],
//         required: true
//     }
// });

// // --- Mongoose Models ---
// const User = mongoose.model('User', UserSchema);
// const Course = mongoose.model('Course', CourseSchema);
// const AccessKey = mongoose.model('AccessKey', AccessKeySchema);

// // --- Initialize Access Keys (Run Once) ---
// const initializeKeys = async () => {
//     try {
//         const adminKeyExists = await AccessKey.findOne({ role: 'admin' });
//         if (!adminKeyExists) {
//             await AccessKey.create({ key: 'admin123', role: 'admin' });
//             console.log('Default Admin key created (admin123)');
//         }

//         const superadminKeyExists = await AccessKey.findOne({ role: 'superadmin' });
//         if (!superadminKeyExists) {
//             await AccessKey.create({ key: 'superadmin123', role: 'superadmin' });
//             console.log('Default Superadmin key created (superadmin123)');
//         }
//     } catch (err) {
//         // Handle potential unique constraint errors if run multiple times concurrently
//         if (err.code !== 11000) {
//             console.error('Error creating initial keys:', err);
//         }
//     }
// };

// // Initialize admin/superadmin keys when the server starts
// initializeKeys();

// // --- Authentication Middleware ---
// const auth = async (req, res, next) => {
//     const token = req.header('x-auth-token');

//     // Check if no token
//     if (!token) {
//         // Use 401 Unauthorized
//         return res.status(401).json({ msg: 'No token, authorization denied' });
//     }

//     // Verify token
//     try {
//         const decoded = jwt.verify(token, JWT_SECRET); // Use secret from env vars
//         // Add user from payload to request object
//         // Fetch fresh user data to ensure role/permissions are up-to-date
//         const user = await User.findById(decoded.user.id).select('-password');
//         if (!user) {
//           // If user associated with token no longer exists
//           return res.status(401).json({ msg: 'Token is not valid, user not found' });
//         }
//         req.user = user; // Attach user object (without password) to the request
//         next(); // Proceed to the next middleware/route handler
//     } catch (err) {
//         console.error('Token verification failed:', err.message);
//         // Use 401 Unauthorized for invalid tokens
//         res.status(401).json({ msg: 'Token is not valid' });
//     }
// };

// // --- Role-Based Access Control Middleware ---
// const checkRole = (allowedRoles) => (req, res, next) => {
//     // Ensure auth middleware ran first and attached req.user
//     if (!req.user || !req.user.role) {
//          // This shouldn't happen if auth middleware is used correctly, but good failsafe
//          return res.status(401).json({ msg: 'Authentication required' });
//     }

//     if (!allowedRoles.includes(req.user.role)) {
//         // Use 403 Forbidden for access denied due to role
//         return res.status(403).json({ msg: 'Access denied. You do not have the required permissions.' });
//     }
//     next(); // User has the required role, proceed
// };

// // --- API Routes ---



// // Register User Route
// app.post('/api/register', async (req, res) => {
//     console.log('Register API called with body:', req.body); // Log incoming data
//     // Destructure with default role if not provided (though schema has default)
//     const { name, email, password, role = 'student', accessKey } = req.body;

//     // Basic Input Validation
//     if (!name || !email || !password) {
//       return res.status(400).json({ msg: 'Please provide name, email, and password' });
//     }
//     if (role !== 'student' && role !== 'admin' && role !== 'superadmin') {
//       return res.status(400).json({ msg: 'Invalid role specified' });
//     }

//     try {
//         // 1. Check if user already exists
//         let user = await User.findOne({ email: email.toLowerCase() }); // Check using lowercase email
//         if (user) {
//             console.log(`Registration failed: User already exists with email ${email}`);
//             return res.status(400).json({ msg: 'User already exists with this email' });
//         }

//         // 2. Validate access key for admin/superadmin roles
//         let assignedRole = role; // Start with the requested role
//         if (role === 'admin' || role === 'superadmin') {
//             if (!accessKey) {
//                 console.log(`Registration failed: Access key required for role ${role}`);
//                 return res.status(400).json({ msg: `Access key is required for the '${role}' role` });
//             }

//             const validKey = await AccessKey.findOne({ key: accessKey, role: role });
//             if (!validKey) {
//                 console.log(`Registration failed: Invalid access key '${accessKey}' for role ${role}`);
//                 return res.status(400).json({ msg: 'Invalid access key for the specified role' });
//             }
//             // Role confirmed by valid key
//             assignedRole = role;
//         } else {
//           // Ensure role is explicitly student if no access key logic applied
//           assignedRole = 'student';
//         }

//         // 3. Create new user instance (password will be hashed next)
//         user = new User({
//             name,
//             email: email.toLowerCase(), // Store email in lowercase
//             password, // Plain password initially
//             role: assignedRole // Use the validated or default role
//         });

//         // 4. Hash password
//         console.log('Hashing password...');
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(password, salt); // Replace plain password with hash
//         console.log('Password hashed.');

//         // 5. Save user to database
//         await user.save();
//         console.log(`User registered successfully: ${user.email} (ID: ${user.id})`);

//         // 6. Create JWT Payload
//         const payload = {
//             user: {
//                 id: user.id,
//                 role: user.role // Include role in payload for convenience
//             }
//         };

//         // 7. Sign JWT
//         jwt.sign(
//             payload,
//             JWT_SECRET, // Use secret from env vars
//             { expiresIn: '1h' }, // Token expires in 1 hour (adjust as needed)
//             (err, token) => {
//                 if (err) throw err; // Let the outer catch handle JWT signing errors
//                 // 8. Send Response (Token and Role)
//                 console.log(`JWT generated for user ${user.id}. Sending response.`);
//                 // Send back token and the user's role
//                 res.status(201).json({ token, role: user.role }); // Use 201 Created status
//             }
//         );
//     } catch (err) {
//         // Log the detailed error on the server
//         console.error('Error during registration:', err.message);
//         console.error(err.stack); // Log stack trace for better debugging

//         // Send a generic error message to the client
//         res.status(500).json({ msg: 'Server error during registration' });
//     }
// });

// // Login User Route
// app.post('/api/login', async (req, res) => {
//     console.log('Login API called with body:', req.body);
//     const { email, password } = req.body;

//     // Basic Input Validation
//     if (!email || !password) {
//       return res.status(400).json({ msg: 'Please provide both email and password' });
//     }

//     try {
//         // 1. Check if user exists
//         // Find user by lowercase email and select password explicitly as it's needed for comparison
//         let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
//         if (!user) {
//             console.log(`Login failed: User not found for email ${email}`);
//             // Use a generic message for security (don't reveal if email exists)
//             return res.status(400).json({ msg: 'Invalid credentials' });
//         }

//         // 2. Validate password
//         console.log(`Comparing password for user ${email}`);
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             console.log(`Login failed: Password mismatch for user ${email}`);
//             // Use a generic message for security
//             return res.status(400).json({ msg: 'Invalid credentials' });
//         }
//         console.log(`Password match successful for user ${email}`);

//         // 3. Create JWT Payload
//         const payload = {
//             user: {
//                 id: user.id,
//                 role: user.role // Include role
//             }
//         };

//         // 4. Sign JWT
//         jwt.sign(
//             payload,
//             JWT_SECRET,
//             { expiresIn: '1h' }, // Consistent expiration time
//             (err, token) => {
//                 if (err) throw err;
//                 // 5. Send Response (Token and Role)
//                 console.log(`Login successful, JWT generated for user ${user.id}. Sending response.`);
//                 res.json({ token, role: user.role }); // Send back token and role
//             }
//         );
//     } catch (err) {
//         console.error('Error during login:', err.message);
//         console.error(err.stack);
//         res.status(500).json({ msg: 'Server error during login' });
//     }
// });

// // Get Current Authenticated User Route
// // Requires authentication (valid token)
// app.get('/api/user', auth, async (req, res) => {
//     try {
//         // req.user is attached by the auth middleware
//         // We already fetched the user without the password in the auth middleware
//         res.json(req.user);
//     } catch (err) {
//         console.error('Error fetching current user:', err.message);
//         res.status(500).send('Server error');
//     }
// });

// // Get All Users Route
// // Requires authentication and specific roles (admin or superadmin)
// app.get('/api/users', [auth, checkRole(['admin', 'superadmin'])], async (req, res) => {
//     try {
//         // Fetch all users, excluding their passwords
//         const users = await User.find().select('-password').sort({ createdAt: -1 }); // Sort by newest first
//         res.json(users);
//     } catch (err) {
//         console.error('Error fetching all users:', err.message);
//         res.status(500).send('Server error');
//     }
// });

// // Delete User Route
// // Requires authentication and specific roles (admin or superadmin)
// app.delete('/api/users/:id', [auth, checkRole(['admin', 'superadmin'])], async (req, res) => {
//     try {
//         const userIdToDelete = req.params.id;


//         const deletedUser = await User.findByIdAndDelete(userIdToDelete);

//         if (!deletedUser) {
//             return res.status(404).json({ msg: 'User not found' });
//         }

//         // Optional: Unenroll user from courses upon deletion (good practice)
//         await Course.updateMany(
//             { students: userIdToDelete },
//             { $pull: { students: userIdToDelete } }
//         );

//         console.log(`User deleted successfully: ${deletedUser.email} (ID: ${userIdToDelete}) by ${req.user.email}`);
//         res.json({ msg: 'User removed successfully' });

//     } catch (err) {
//         console.error('Error deleting user:', err.message);
//         // Handle potential CastError if the ID format is invalid
//         if (err.kind === 'ObjectId') {
//             return res.status(400).json({ msg: 'Invalid user ID format' });
//         }
//         res.status(500).send('Server error');
//     }
// });

// // --- Course Routes ---

// // Get Courses Route
// // Behavior depends on user role (determined by auth middleware)
// app.get('/api/courses', auth, async (req, res) => {
//     try {
//         if (req.user.role === 'student') {
//             // Students see only their enrolled courses
//             // Populate 'enrolledCourses' field from the user object attached by 'auth' middleware
//             const userWithCourses = await User.findById(req.user.id).populate({
//                 path: 'enrolledCourses',
//                 select: 'name description' // Select specific fields from Course
//             });
//             if (!userWithCourses) return res.status(404).json({ msg: 'User not found' }); // Should not happen if auth worked
//             res.json(userWithCourses.enrolledCourses || []); // Return empty array if null/undefined
//         } else {
//             // Admins/Superadmins see all courses and the students enrolled in them
//             const courses = await Course.find().populate({
//                 path: 'students',
//                 select: 'name email role' // Select specific fields from User (exclude password!)
//             });
//             res.json(courses);
//         }
//     } catch (err) {
//         console.error('Error fetching courses:', err.message);
//         res.status(500).send('Server error');
//     }
// });

// // Create a New Course Route
// // Requires authentication and specific roles (admin or superadmin)
// app.post('/api/courses', [auth, checkRole(['admin', 'superadmin'])], async (req, res) => {
//     const { name, description } = req.body;

//     if (!name) {
//       return res.status(400).json({ msg: 'Course name is required' });
//     }

//     try {
//         const newCourse = new Course({
//             name,
//             description // Description is optional
//         });
//         await newCourse.save();
//         console.log(`Course created: ${newCourse.name} (ID: ${newCourse.id}) by ${req.user.email}`);
//         res.status(201).json(newCourse); // Return the created course with 201 status
//     } catch (err) {
//         console.error('Error creating course:', err.message);
//         res.status(500).send('Server error');
//     }
// });

// // Enroll Student in a Course Route
// // Requires authentication and specific roles (admin or superadmin)
// app.post('/api/courses/:courseId/enroll/:userId', [auth, checkRole(['admin', 'superadmin'])], async (req, res) => {
//     try {
//         const { courseId, userId } = req.params;

//         // Validate ObjectIds
//         if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(userId)) {
//            return res.status(400).json({ msg: 'Invalid Course or User ID format' });
//         }

//         // Find course and user concurrently
//         const [course, user] = await Promise.all([
//             Course.findById(courseId),
//             User.findById(userId)
//         ]);

//         if (!course) {
//             return res.status(404).json({ msg: 'Course not found' });
//         }
//         if (!user) {
//             return res.status(404).json({ msg: 'User not found' });
//         }

//         // Check if the user is actually a student
//         if (user.role !== 'student') {
//             return res.status(400).json({ msg: 'Only users with the role "student" can be enrolled in courses' });
//         }

//         let updated = false; // Flag to check if any update happened

//         // Add user to course's students list (if not already present)
//         // Use .toString() for comparing ObjectIds
//         if (!course.students.some(studentId => studentId.toString() === user._id.toString())) {
//             course.students.push(user._id);
//             updated = true;
//         }

//         // Add course to user's enrolledCourses list (if not already present)
//         if (!user.enrolledCourses.some(enrolledCourseId => enrolledCourseId.toString() === course._id.toString())) {
//             user.enrolledCourses.push(course._id);
//             updated = true;
//         }

//         // Save changes only if updates were made
//         if (updated) {
//              await Promise.all([course.save(), user.save()]);
//              console.log(`Student ${user.email} enrolled in course ${course.name} by ${req.user.email}`);
//              res.json({ msg: 'Student enrolled successfully' });
//         } else {
//              res.json({ msg: 'Student was already enrolled in this course' });
//         }

//     } catch (err) {
//         console.error('Error enrolling student:', err.message);
//         res.status(500).send('Server error');
//     }
// });







// const studentSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     resetToken: String,
//     resetTokenExpiry: Date,
//     // other fields like role etc. can go here
// });

// // Create and use Student model
// const Student = mongoose.model('Student', studentSchema);

// app.post('/forgot-password', async (req, res) => {
//     const { email } = req.body;
//     const sanitizedEmail = email.trim().toLowerCase();
  
//     try {
//       const user = await User.findOne({ email: sanitizedEmail });
  
//       if (!user) {
//         return res.status(200).json({ 
//           message: 'If this email exists, password reset instructions have been provided.' 
//         });
//       }
  
//       // Generate token
//       const token = crypto.randomBytes(20).toString('hex');
//       user.resetToken = token;
//       user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
//       await user.save();
  
//       // ✅ Setup Nodemailer
//       const transporter = nodemailer.createTransport({
//         service: 'Gmail',
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS,
//         },
//       });
  
//       const resetURL = `http://localhost:3000/reset-password/${token}`;
  
//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: user.email,
//         subject: 'Reset your password',
//         html: `
//           <p>Hi ${user.name},</p>
//           <p>You requested to reset your password.</p>
//           <p><a href="${resetURL}">Click here to reset your password</a></p>
//           <p>This link will expire in 1 hour.</p>
//         `,
//       };
  
//       // ✅ Send email
//       await transporter.sendMail(mailOptions);
//       console.log(`✅ Email sent to ${user.email} with reset link.`);
  
//       res.status(200).json({ message: 'Password reset email sent successfully.' });
  
//     } catch (err) {
//       console.error('Error in forgot-password:', err);
//       res.status(500).json({ message: 'Server error. Please try again later.' });
//     }
//   });



// // ✅ Verify reset token route

// app.get('/api/verify-reset-token/:token', async (req, res) => {
//     try {
//       const { token } = req.params;
//       console.log("Token received for verification:", token);
//       // Add validation for token format
//       if (!token || token.length < 20) {
//         return res.status(400).json({ valid: false, message: 'Invalid token format' });
//       }
      
//       const user = await User.findOne({
//         resetToken: token,
//         resetTokenExpiry: { $gt: Date.now() }
//       });
      
//       if (!user) {
//         return res.status(400).json({ valid: false, message: 'Invalid or expired reset token' });
//       }
      
//       res.json({ valid: true, message: 'Token is valid' });
//     } catch (err) {
//       console.error('Error verifying token:', err);
//       res.status(500).json({ valid: false, message: 'Server error' });
//     }
//   });
  
//   // ✅ Reset password route
//   app.post('/api/reset-password/:token', async (req, res) => {
//     try {
//       const { token } = req.params;
//       const { password, confirmPassword } = req.body;
      
//       // Added password confirmation check
//       if (password !== confirmPassword) {
//         return res.status(400).json({ message: 'Passwords do not match' });
//       }
      
//       if (!password || password.length < 6) {
//         return res.status(400).json({ message: 'Password must be at least 6 characters long' });
//       }
      
//       const user = await User.findOne({
//         resetToken: token,
//         resetTokenExpiry: { $gt: Date.now() }
//       });
      
//       if (!user) {
//         return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
//       }
      
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//       user.resetToken = undefined;
//       user.resetTokenExpiry = undefined;
//       await user.save();
      
//       // Consider sending a confirmation email
//       console.log(`Password reset successful for user: ${user.email}`);
//       res.json({ message: 'Password has been reset successfully' });
//     } catch (err) {
//       console.error('Error resetting password:', err);
//       res.status(500).json({ message: 'Server error. Try again later.' });
//     }
//   });
  
















// // --- Unenroll Student from a Course Route (Optional but useful) ---
// // Requires authentication and specific roles (admin or superadmin)
// app.post('/api/courses/:courseId/unenroll/:userId', [auth, checkRole(['admin', 'superadmin'])], async (req, res) => {
//     try {
//         const { courseId, userId } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(userId)) {
//            return res.status(400).json({ msg: 'Invalid Course or User ID format' });
//         }

//         const [course, user] = await Promise.all([
//             Course.findById(courseId),
//             User.findById(userId)
//         ]);

//         if (!course) return res.status(404).json({ msg: 'Course not found' });
//         if (!user) return res.status(404).json({ msg: 'User not found' });

//         let updated = false;

//         // Remove user from course's students list
//         const initialStudentCount = course.students.length;
//         course.students = course.students.filter(studentId => studentId.toString() !== user._id.toString());
//         if(course.students.length < initialStudentCount) updated = true;


//         // Remove course from user's enrolledCourses list
//         const initialCourseCount = user.enrolledCourses.length;
//         user.enrolledCourses = user.enrolledCourses.filter(enrolledCourseId => enrolledCourseId.toString() !== course._id.toString());
//         if(user.enrolledCourses.length < initialCourseCount) updated = true;


//         if (updated) {
//             await Promise.all([course.save(), user.save()]);
//             console.log(`Student ${user.email} unenrolled from course ${course.name} by ${req.user.email}`);
//             res.json({ msg: 'Student unenrolled successfully' });
//         } else {
//             res.json({ msg: 'Student was not enrolled in this course' });
//         }

//     } catch (err) {
//         console.error('Error unenrolling student:', err.message);
//         res.status(500).send('Server error');
//     }
// });



// // --- Start Server ---
// app.listen(PORT, () => console.log(`Server started successfully on port ${PORT}`));







































// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');

// Import config
const { connectDB } = require('./config/db');

// App Config
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ["https://learning-management-system-backend-code-aiqn.vercel.app","http://localhost:3000"] }));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize Access Keys
const { initializeKeys } = require('./utils/initializeKeys');
initializeKeys();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);


app.get('/', async (req, res) => {
  try {
   res.send("welcome to lMS api");
  } catch (err) {
    res.status(500).json({message:"something wrong "});
  }
});
// app.use('/api/superadmin', superadminRoutes);

// Start server
// app.listen(PORT, () => console.log(`Server started successfully on port ${PORT}`));
module.exports = app;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  // Close server & exit process
  // server.close(() => process.exit(1));
});