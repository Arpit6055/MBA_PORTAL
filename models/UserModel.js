/**
 * User Model - All user-related database operations
 * Centralized MongoDB queries for user account management
 */

const db = require('../config/db');
const { ObjectId } = require('mongodb');

class UserModel {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    return await db.findOne('users', { email });
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return await db.findOne('users', { _id: id });
  }

  /**
   * Create a new user
   */
  static async create(email, phone = null) {
    const user = {
      email,
      phone,
      is_verified: false,
      acad_10th: null,
      acad_12th: null,
      acad_grad: null,
      acad_stream: null,
      current_company: null,
      work_ex_months: 0,
      profile_complete: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    return await db.insertOne('users', user);
  }

  /**
   * Verify user email (mark as verified)
   */
  static async verifyEmail(email) {
    return await db.updateOne('users', { email }, {
      is_verified: true,
      updated_at: new Date(),
    });
  }

  /**
   * Update user academic profile
   */
  static async updateAcademicProfile(userId, marks10th, marks12th, marksGrad, stream) {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    return await db.updateOne('users', { _id: userId }, {
      acad_10th: marks10th,
      acad_12th: marks12th,
      acad_grad: marksGrad,
      acad_stream: stream,
      updated_at: new Date(),
    });
  }

  /**
   * Update user work experience
   */
  static async updateWorkExperience(userId, currentCompany, experienceMonths) {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    return await db.updateOne('users', { _id: userId }, {
      current_company: currentCompany,
      work_ex_months: experienceMonths,
      updated_at: new Date(),
    });
  }

  /**
   * Update user target colleges
   */
  static async updateTargetColleges(userId, colleges = []) {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    return await db.updateOne('users', { _id: userId }, {
      target_colleges: colleges,
      updated_at: new Date(),
    });
  }

  /**
   * Mark profile as complete
   */
  static async markProfileComplete(userId) {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    return await db.updateOne('users', { _id: userId }, {
      profile_complete: true,
      updated_at: new Date(),
    });
  }

  /**
   * Get user with full profile details
   */
  static async getFullProfile(userId) {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    return await db.findOne('users', { _id: userId });
  }

  /**
   * Get all users (for admin, with pagination)
   */
  static async getAll(limit = 20, offset = 0) {
    return await db.findMany('users', {}, {
      sort: { created_at: -1 },
      limit,
      skip: offset,
    });
  }

  /**
   * Get user count
   */
  static async getTotalCount() {
    return await db.countDocuments('users');
  }

  /**
   * Delete user
   */
  static async delete(userId) {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    return await db.deleteOne('users', { _id: userId });
  }
}

module.exports = UserModel;
