const User = require('../models/User');
const jwt = require('jsonwebtoken');

/** Consistent user JSON for /me and /profile (and lean documents). */
const toPublicUserPayload = (user) => {
  const u =
    user && typeof user.toObject === 'function'
      ? user.toObject({ virtuals: true })
      : { ...user };
  const fullName = u.fullName || `${u.firstName} ${u.lastName}`;
  const initials =
    u.initials ||
    `${String(u.firstName).charAt(0)}${String(u.lastName).charAt(0)}`.toUpperCase();
  return {
    id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
    fullName,
    initials,
    avatar: u.avatar,
    bio: u.bio,
    skills: u.skills,
    teams: u.teams,
    isActive: u.isActive,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate JWT Token for authenticated user
 * @param {string} userId - User's MongoDB ID
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Send token response to client
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  // Generate token
  const token = generateToken(user._id);

  // Remove password from output
  const userResponse = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    avatar: user.avatar,
    bio: user.bio,
    skills: user.skills,
    isActive: user.isActive,
    createdAt: user.createdAt
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userResponse
  });
};

// ============================================
// REGISTER CONTROLLER
// ============================================

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 * @body    { firstName, lastName, email, password }
 */
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // ===== VALIDATION =====
    // Check for missing required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, password'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // ===== CHECK EXISTING USER =====
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // ===== CREATE USER =====
    // Create new user (password will be hashed by pre-save middleware)
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    // ===== SEND RESPONSE =====
    sendTokenResponse(user, 201, res, 'User registered successfully');

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle duplicate key error (MongoDB)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// LOGIN CONTROLLER
// ============================================

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 * @body    { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ===== VALIDATION =====
    // Check for missing fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // ===== FIND USER =====
    // Find user by email and include password field (since select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ===== CHECK ACCOUNT STATUS =====
    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // ===== VERIFY PASSWORD =====
    // Compare entered password with hashed password
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ===== UPDATE LAST LOGIN =====
    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // ===== SEND RESPONSE =====
    sendTokenResponse(user, 200, res, 'Login successful');

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// GET CURRENT USER CONTROLLER
// ============================================

/**
 * @desc    Get currently logged in user
 * @route   GET /api/auth/me
 * @access  Private (requires authentication token)
 */
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    // Use lean() + no populate so /me never requires a registered Team model (teams.teamId stays ObjectIds).
    const user = await User.findById(req.user.id).select('-password').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: toPublicUserPayload(user)
    });

  } catch (error) {
    console.error('❌ GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// LOGOUT CONTROLLER
// ============================================

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 * @note    For JWT, logout is handled client-side by removing the token
 *          This endpoint exists for API completeness
 */
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// ============================================
// UPDATE PROFILE CONTROLLER
// ============================================

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 * @body    { firstName, lastName, bio, skills, avatar }
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, skills, avatar } = req.body;
    
    // Build update object
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName.trim();
    if (lastName) updateFields.lastName = lastName.trim();
    if (bio !== undefined) updateFields.bio = bio;
    if (skills) updateFields.skills = skills;
    if (avatar) updateFields.avatar = avatar;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: toPublicUserPayload(user)
    });

  } catch (error) {
    console.error('❌ UpdateProfile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// CHANGE PASSWORD CONTROLLER
// ============================================

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 * @body    { currentPassword, newPassword }
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ ChangePassword error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================
module.exports = {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword
};