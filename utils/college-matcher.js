/**
 * College Matching Utility
 * Finds college mentions in text using exact and fuzzy matching
 */

const Fuse = require('fuse.js');
const CollegeModel = require('../models/CollegeModel');

class CollegeMatcherUtil {
  static collegeFuse = null;
  static collegeMap = null;

  /**
   * Initialize the fuzzy matcher
   */
  static async initialize() {
    if (this.collegeFuse) return; // Already initialized

    const colleges = await CollegeModel.findAll();
    
    // Build vocabulary with all college names and aliases
    const searchData = [];
    this.collegeMap = {};

    for (const college of colleges) {
      // Add exact name
      searchData.push({ name: college.name, collegiate: college.name });
      this.collegeMap[college.name.toLowerCase()] = college.name;
      
      // Add aliases
      if (college.aliases && Array.isArray(college.aliases)) {
        for (const alias of college.aliases) {
          searchData.push({ name: alias, collegiate: college.name });
          this.collegeMap[alias.toLowerCase()] = college.name;
        }
      }
    }

    // Initialize Fuse fuzzy matcher
    this.collegeFuse = new Fuse(searchData, {
      keys: ['name'],
      threshold: 0.2, // Stricter threshold (80% match required)
      includeScore: true,
      minMatchCharLength: 4, // Minimum characters to match
    });
  }

  /**
   * Extract college mentions from text
   */
  static async extractCollegeMentions(text) {
    await this.initialize();

    const foundColleges = new Set();
    const lowerText = text.toLowerCase();

    // First, try exact matches with word boundaries
    for (const [key, collegeName] of Object.entries(this.collegeMap)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      if (lowerText.match(regex)) {
        foundColleges.add(collegeName);
      }
    }

    // Then try fuzzy matching on text segments
    const words = text.match(/\b[\w\s]{4,}\b/g) || [];
    for (const word of words) {
      if (word.length < 4) continue;
      
      const results = this.collegeFuse.search(word.trim());
      if (results.length > 0 && results[0].score < 0.2) { // Stricter score
        foundColleges.add(results[0].item.collegiate);
      }
    }

    // Get college objects from database
    const colleges = [];
    for (const collegeName of foundColleges) {
      const college = await CollegeModel.findByName(collegeName);
      if (college) {
        colleges.push(college);
      }
    }

    return colleges;
  }

  /**
   * Check if text contains any college mention
   */
  static async hasCollegeMention(text) {
    const colleges = await this.extractCollegeMentions(text);
    return colleges.length > 0;
  }
}

module.exports = CollegeMatcherUtil;
