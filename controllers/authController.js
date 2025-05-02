// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const AccessKey = require('../models/AccessKey');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET ;

// Register Controller
exports.register = async (req, res) => {
 
  const { name, email, password, role = 'student', accessKey } = req.body;

  // Basic Input Validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please provide name, email, and password' });
  }
  if (role !== 'student' && role !== 'admin' && role !== 'superadmin') {
    return res.status(400).json({ msg: 'Invalid role specified' });
  }

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
   
      return res.status(400).json({ msg: 'User already exists with this email' });
    }

    // 2. Validate access key for admin/superadmin roles
    let assignedRole = role;
    if (role === 'admin' || role === 'superadmin') {
      if (!accessKey) {
     
        return res.status(400).json({ 
          msg: `Access key is required for the '${role}' role` 
        });
      }

      const validKey = await AccessKey.findOne({ key: accessKey, role: role });
      if (!validKey) {
   
        return res.status(400).json({ msg: 'Invalid access key for the specified role' });
      }
      assignedRole = role;
    } else {
      assignedRole = 'student';
    }

    // 3. Create new user instance
    user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole
    });

    // 4. Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    console.log('Password hashed.');

    // 5. Save user to database
    await user.save();
  

    // 6. Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // 7. Sign JWT
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
    
        res.status(201).json({ token, role: user.role });
      }
    );
  } catch (err) {
   

    res.status(500).json({ msg: 'Server error during registration' });
  }
};

// Login Controller
exports.login = async (req, res) => {
  
  const { email, password } = req.body;

  // Basic Input Validation
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide both email and password' });
  }

  try {
    // 1. Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`Login failed: User not found for email ${email}`);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // 2. Validate password
    console.log(`Comparing password for user ${email}`);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for user ${email}`);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    console.log(`Password match successful for user ${email}`);

    // 3. Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // 4. Sign JWT
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        console.log(`Login successful, JWT generated for user ${user.id}. Sending response.`);
        res.json({ token, role: user.role });
      }
    );
  } catch (err) {
    
    console.error(err.stack);
    res.status(500).json({ msg: 'Server error during login' });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
   
    res.status(500).send('Server error');
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const sanitizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      // Don't reveal if user exists for security reasons
      return res.status(200).json({ 
        message: 'If this email exists, password reset instructions have been provided.' 
      });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetURL = `https://learning-management-system-backend-code-aiqn.vercel.app/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Reset your password',
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password.</p>
        <p><a href="${resetURL}">Click here to reset your password</a></p>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  

    res.status(200).json({ message: 'Password reset email sent successfully.' });

  } catch (err) {
    
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Verify Reset Token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
  
    
    // Add validation for token format
    if (!token || token.length < 20) {
      return res.status(400).json({ valid: false, message: 'Invalid token format' });
    }
    
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired reset token' });
    }
    
    res.json({ valid: true, message: 'Token is valid' });
  } catch (err) {
  
    res.status(500).json({ valid: false, message: 'Server error' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    
    // Added password confirmation check
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    
 
    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
};