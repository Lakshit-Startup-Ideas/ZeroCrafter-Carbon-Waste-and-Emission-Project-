const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { jwtHelpers, errorHelpers } = require('../shared');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'),
  body('companyName')
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Company name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'staff'])
    .withMessage('Role must be either admin or staff'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// POST /api/auth/register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { email, password, companyName, role = 'staff' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: {
          message: 'User with this email already exists',
          statusCode: 400,
          code: 'DUPLICATE_ERROR',
          field: 'email',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      companyName,
      role,
    });

    await user.save();

    // Generate JWT token
    const token = jwtHelpers.generateToken(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRES_IN
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: user.profile,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(errorHelpers.createError('Registration failed'));
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          statusCode: 401,
          code: 'AUTH_ERROR',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: {
          message: 'Account is deactivated',
          statusCode: 401,
          code: 'AUTH_ERROR',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          statusCode: 401,
          code: 'AUTH_ERROR',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwtHelpers.generateToken(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRES_IN
    );

    res.json({
      message: 'Login successful',
      user: user.profile,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(errorHelpers.createError('Login failed'));
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // by removing the token. This endpoint can be used for logging.
  res.json({
    message: 'Logout successful',
  });
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json(errorHelpers.notFoundError('User'));
    }

    res.json({
      user: user.profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(errorHelpers.createError('Failed to get profile'));
  }
});

// POST /api/auth/reset-password (placeholder for future implementation)
router.post('/reset-password', [
  body('email').isEmail().withMessage('Please enter a valid email address'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        message: 'If an account with this email exists, a password reset link has been sent',
      });
    }

    // TODO: Implement password reset logic
    // 1. Generate reset token
    // 2. Send email with reset link
    // 3. Store reset token with expiration

    res.json({
      message: 'If an account with this email exists, a password reset link has been sent',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json(errorHelpers.createError('Password reset failed'));
  }
});

module.exports = router; 