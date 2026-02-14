/**
 * Authentication Controller
 * Handles OTP-based login and user verification
 */

const UserModel = require('../models/UserModel');
const OTPModel = require('../models/OTPModel');
const { sendOTPEmail, sendWelcomeEmail } = require('../config/emailService');

/**
 * Step 1: Request OTP - User enters email
 * POST /auth/request-otp
 */
const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Check rate limiting
    const isRateLimited = await OTPModel.isRateLimited(email, 3, 15);
    if (isRateLimited) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after 15 minutes.',
      });
    }

    // Create or update user (if doesn't exist)
    let user = await UserModel.findByEmail(email);
    if (!user) {
      user = await UserModel.create(email);
    }

    // Generate and store OTP
    const otpRecord = await OTPModel.createOTP(email, 10); // 10 minutes expiry

    // Send OTP via email
    await sendOTPEmail(email, otpRecord.otp_code);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Valid for 10 minutes.',
      userId: user._id,
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Step 2: Verify OTP and log user in
 * POST /auth/verify-otp
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Verify OTP from database
    const otpRecord = await OTPModel.verifyOTP(email, otp);
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.',
      });
    }

    // Get user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    // Mark OTP as used
    await OTPModel.markOTPAsUsed(otpRecord.id);

    // Verify email if not already verified
    if (!user.is_verified) {
      await UserModel.verifyEmail(email);
      // Send welcome email
      await sendWelcomeEmail(email, email.split('@')[0]);
    }

    // Set session/cookie
    req.session.userId = user._id || user.id;
    req.session.email = user.email;
    req.session.isVerified = true;

    console.log('✓ Session set for user:', req.session.userId);

    // Save session before sending response
    req.session.save((err) => {
      if (err) {
        console.error('✗ Error saving session:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to create session. Please try again.',
          error: err.message,
        });
      }

      console.log('✓ Session saved successfully');
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully. Logging you in...',
        userId: user._id || user.id,
        profileComplete: user.profile_complete,
        redirectUrl: '/news',
      });
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Step 3: Resend OTP
 * POST /auth/resend-otp
 */
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Check rate limiting
    const isRateLimited = await OTPModel.isRateLimited(email, 3, 15);
    if (isRateLimited) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after 15 minutes.',
      });
    }

    // Create new OTP
    const otpRecord = await OTPModel.createOTP(email, 10);

    // Send OTP via email
    await sendOTPEmail(email, otpRecord.otp_code);

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email.',
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Logout user
 * GET /auth/logout
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to logout',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      redirectUrl: '/login',
    });
  });
};

/**
 * Get current user info
 * GET /auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const user = await UserModel.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        isVerified: user.is_verified,
        profileComplete: user.profile_complete,
        currentCompany: user.current_company,
      },
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user information',
      error: error.message,
    });
  }
};

/**
 * Complete user profile
 * POST /auth/complete-profile
 */
const completeProfile = async (req, res) => {
  try {
    // Check authentication
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in.',
      });
    }

    const { marks10th, marks12th, marksGrad, stream, company, experienceMonths, colleges } = req.body;

    // Validate inputs
    if (!marks10th || !marks12th || !marksGrad || !stream) {
      return res.status(400).json({
        success: false,
        message: 'Academic details are required',
      });
    }

    // Update academic profile
    await UserModel.updateAcademicProfile(
      req.session.userId,
      parseFloat(marks10th),
      parseFloat(marks12th),
      parseFloat(marksGrad),
      stream
    );

    // Update work experience if provided
    if (company && experienceMonths !== undefined) {
      await UserModel.updateWorkExperience(
        req.session.userId,
        company,
        parseInt(experienceMonths)
      );
    }

    // Save target colleges if provided
    if (colleges && colleges.length > 0) {
      await UserModel.saveTargetColleges(req.session.userId, colleges);
    }

    // Mark profile as complete
    await UserModel.markProfileComplete(req.session.userId);

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully!',
      redirectUrl: '/news',
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete profile. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Helper function to validate email format
 */

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Middleware: Check if user is authenticated
 */
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Please log in.',
    });
  }
  next();
};

module.exports = {
  requestOTP,
  verifyOTP,
  resendOTP,
  completeProfile,
  logout,
  getCurrentUser,
  isAuthenticated,
};
