/**
 * Authentication Routes
 * Handles OTP-based login and user verification endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Public Routes (No Authentication Required)
 */

// Request OTP at login
router.post('/request-otp', authController.requestOTP);

// Verify OTP and log user in
router.post('/verify-otp', authController.verifyOTP);

// Resend OTP
router.post('/resend-otp', authController.resendOTP);

/**
 * Protected Routes (Authentication Required)
 */

// Get current user info
router.get('/me', authController.isAuthenticated, authController.getCurrentUser);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
