const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import controllers
const {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword
} = require('../controllers/authController');

// Import middleware
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

// Multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user?.id ?? 'user'}-${Date.now()}${ext}`);
  },
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   GET /api/auth
 * @desc    List auth endpoints (browser / Postman sanity check)
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'UniHub authentication API',
    basePath: '/api/auth',
    endpoints: {
      register: { method: 'POST', path: '/api/auth/register', body: ['firstName', 'lastName', 'email', 'password'] },
      login: { method: 'POST', path: '/api/auth/login', body: ['email', 'password'] },
      me: { method: 'GET', path: '/api/auth/me', auth: 'Bearer token' },
      logout: { method: 'POST', path: '/api/auth/logout', auth: 'Bearer token' },
      profile: { method: 'PUT', path: '/api/auth/profile', auth: 'Bearer token' },
      changePassword: { method: 'PUT', path: '/api/auth/change-password', auth: 'Bearer token' },
      check: { method: 'GET', path: '/api/auth/check', auth: 'Bearer token (optional)' },
      adminHealth: { method: 'GET', path: '/api/auth/admin/health', auth: 'Bearer token (admin only)' }
    }
  });
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { firstName, lastName, email, password }
 * @returns { token, user }
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password }
 * @returns { token, user }
 */
router.post('/login', login);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private (requires token)
 * @headers { Authorization: Bearer <token> }
 * @returns { user }
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 * @headers { Authorization: Bearer <token> }
 * @returns { success, message }
 */
router.post('/logout', protect, logout);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 * @headers { Authorization: Bearer <token> }
 * @body    { firstName, lastName, bio, skills, avatar }
 * @returns { user }
 */
router.put('/profile', protect, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 * @headers { Authorization: Bearer <token> }
 * @body    { currentPassword, newPassword }
 * @returns { success, message }
 */
router.put('/change-password', protect, changePassword);

// ============================================
// OPTIONAL AUTH ROUTES (Works with or without token)
// ============================================

/**
 * @route   GET /api/auth/check
 * @desc    Check if user is authenticated (returns user if token valid)
 * @access  Public (but returns user data if token provided)
 * @headers { Authorization: Bearer <token> (optional) }
 * @returns { isAuthenticated, user (if authenticated) }
 */
/**
 * @route   GET /api/auth/admin/health
 * @desc    Confirms JWT + admin role (demo for authorize middleware)
 * @access  Private / admin only
 */
router.get('/admin/health', protect, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin authorization OK'
  });
});

router.get('/check', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        fullName: req.user.fullName
      }
    });
  } else {
    res.json({
      isAuthenticated: false,
      user: null
    });
  }
});

// ============================================
// ADMIN ROUTES (Will be expanded later)
// ============================================

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 * @headers { Authorization: Bearer <token> }
 * @returns { users[] }
 */
// router.get('/users', protect, authorize('admin'), getAllUsers);

/**
 * @route   PUT /api/auth/users/:id/toggle-status
 * @desc    Toggle user account status (Admin only)
 * @access  Private/Admin
 * @headers { Authorization: Bearer <token> }
 * @returns { user }
 */
// router.put('/users/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);

// ============================================
// AVATAR UPLOAD ROUTE
// ============================================

/**
 * @route   POST /api/auth/avatar
 * @desc    Upload profile picture
 * @access  Private
 */
router.post('/avatar', protect, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const User = require('../models/User');
    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json({ success: true, avatarUrl, user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ============================================
// EXPORT ROUTER
// ============================================
module.exports = router;