const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// PROTECT MIDDLEWARE - Authentication
// ============================================

/**
 * @desc    Protect routes - Verify JWT token and attach user to request
 * @usage   Add to any route that requires authentication
 * @example router.get('/dashboard', protect, getDashboard)
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer TOKEN_STRING"
      token = authHeader.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token (exclude password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token may be invalid.'
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      // Attach user to request object for use in next middleware/controller
      req.user = user;
      next();

    } catch (error) {
      console.error('❌ Auth middleware error:', error);

      // Handle different JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      }

      // Generic auth error
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  }

  // No token provided
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.'
    });
  }
};

// ============================================
// AUTHORIZE MIDDLEWARE - Role-Based Access
// ============================================

/**
 * @desc    Grant access to specific user roles
 * @param   {...string} roles - Allowed roles (e.g., 'admin', 'student')
 * @usage   Add after protect middleware
 * @example router.delete('/user/:id', protect, authorize('admin'), deleteUser)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user role is in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. User role '${req.user.role}' is not authorized to access this route.`,
        allowedRoles: roles
      });
    }
    next();
  };
};

// ============================================
// TEAM LEADER MIDDLEWARE - Team Operations
// ============================================

/**
 * @desc    Check if user is a team leader for a specific team
 * @param   {string} teamIdParam - Name of the parameter containing team ID (default: 'teamId')
 * @usage   Add after protect middleware for team leader operations
 * @example router.post('/teams/:teamId/invite', protect, isTeamLeader(), inviteMember)
 */
const isTeamLeader = (teamIdParam = 'teamId') => {
  return async (req, res, next) => {
    try {
      const teamId = req.params[teamIdParam];
      
      if (!teamId) {
        return res.status(400).json({
          success: false,
          message: 'Team ID is required'
        });
      }

      // Check if user is a leader of this team
      const userTeams = req.user.teams || [];
      const isLeader = userTeams.some(
        team => team.teamId && team.teamId.toString() === teamId && team.role === 'leader'
      );
      
      if (!isLeader) {
        return res.status(403).json({
          success: false,
          message: 'Only team leaders can perform this action'
        });
      }
      
      next();
    } catch (error) {
      console.error('❌ Team leader check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying team leadership'
      });
    }
  };
};

// ============================================
// TEAM MEMBER MIDDLEWARE - Team Access
// ============================================

/**
 * @desc    Check if user is a member of a specific team
 * @param   {string} teamIdParam - Name of the parameter containing team ID (default: 'teamId')
 * @usage   Add after protect middleware for team member operations
 * @example router.get('/teams/:teamId/tasks', protect, isTeamMember(), getTeamTasks)
 */
const isTeamMember = (teamIdParam = 'teamId') => {
  return async (req, res, next) => {
    try {
      const teamId = req.params[teamIdParam];
      
      if (!teamId) {
        return res.status(400).json({
          success: false,
          message: 'Team ID is required'
        });
      }

      // Check if user is a member of this team
      const userTeams = req.user.teams || [];
      const isMember = userTeams.some(
        team => team.teamId && team.teamId.toString() === teamId
      );
      
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'You must be a member of this team to access this resource'
        });
      }
      
      next();
    } catch (error) {
      console.error('❌ Team member check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying team membership'
      });
    }
  };
};

// ============================================
// OPTIONAL AUTH MIDDLEWARE
// ============================================

/**
 * @desc    Optional authentication - doesn't require token but attaches user if present
 * @usage   For routes that work both with and without authentication
 * @example router.get('/public-posts', optionalAuth, getPosts)
 */
const optionalAuth = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid - just continue without user
      console.log('Optional auth: Invalid token provided');
    }
  }
  
  next();
};

// ============================================
// SELF OR ADMIN MIDDLEWARE
// ============================================

/**
 * @desc    Allow access if user is themselves or admin
 * @param   {string} userIdParam - Name of the parameter containing user ID (default: 'id')
 * @usage   Add after protect middleware
 * @example router.put('/users/:id', protect, selfOrAdmin('id'), updateUser)
 */
const selfOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
    const targetUserId = req.params[userIdParam];
    const currentUser = req.user;
    
    // Allow if user is admin OR user is accessing their own profile
    if (currentUser.role === 'admin' || currentUser.id === targetUserId) {
      return next();
    }
    
    res.status(403).json({
      success: false,
      message: 'You can only access your own profile'
    });
  };
};

// ============================================
// EXPORT ALL MIDDLEWARES
// ============================================
module.exports = {
  protect,           // Main authentication middleware
  authorize,         // Role-based access control
  isTeamLeader,      // Team leader check
  isTeamMember,      // Team member check
  optionalAuth,      // Optional authentication
  selfOrAdmin        // Self or admin access
};