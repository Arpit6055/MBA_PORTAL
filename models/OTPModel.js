/**
 * OTP Model - All OTP-related database operations
 * Handles OTP generation, storage, and validation
 */

const db = require('../config/db');
const { ObjectId } = require('mongodb');

class OTPModel {
  /**
   * Generate a 6-digit OTP
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create and store OTP for email
   * @param {string} email - User email
   * @param {number} expiryMinutes - OTP expiry time in minutes (default: 10)
   */
  static async createOTP(email, expiryMinutes = 10) {
    const otpCode = this.generateOTP();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60000); // Current time + expiryMinutes

    const otp = {
      email,
      otp_code: otpCode,
      expires_at: expiresAt,
      is_used: false,
      created_at: new Date(),
    };

    return await db.insertOne('otps', otp);
  }

  /**
   * Verify OTP for email
   * @param {string} email - User email
   * @param {string} otpCode - OTP code to verify
   * @returns {Object} OTP record if valid, null if invalid/expired
   */
  static async verifyOTP(email, otpCode) {
    const now = new Date();
    return await db.findOne('otps', {
      email,
      otp_code: otpCode,
      is_used: false,
      expires_at: { $gt: now },
    });
  }

  /**
   * Mark OTP as used
   */
  static async markOTPAsUsed(otpId) {
    if (typeof otpId === 'string') {
      otpId = new ObjectId(otpId);
    }
    return await db.updateOne('otps', { _id: otpId }, { is_used: true });
  }

  /**
   * Get latest OTP for email (for resend functionality)
   */
  static async getLatestOTP(email) {
    const otps = await db.findMany('otps', { email }, {
      sort: { created_at: -1 },
      limit: 1,
    });
    return otps[0] || null;
  }

  /**
   * Clean up expired OTPs (run as periodic job)
   */
  static async cleanupExpiredOTPs() {
    const now = new Date();
    const deleted = await db.deleteMany('otps', {
      expires_at: { $lt: now },
      is_used: false,
    });
    
    if (deleted > 0) {
      console.log(`✓ Cleaned up ${deleted} expired OTPs`);
    }
    return deleted;
  }

  /**
   * Check if email is rate-limited (too many OTP requests)
   * Limit: max 3 OTPs in 15 minutes
   */
  static async isRateLimited(email, maxAttempts = 3, windowMinutes = 15) {
    const windowStart = new Date(Date.now() - windowMinutes * 60000);
    const count = await db.countDocuments('otps', {
      email,
      created_at: { $gt: windowStart },
    });
    return count >= maxAttempts;
  }
}

module.exports = OTPModel;
