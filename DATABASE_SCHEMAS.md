# Database Schema & Models Implementation Guide

## Overview
This document provides precise implementation guidance for the new MongoDB schemas and Mongoose/MongoDB models.

---

## 1. COLLEGES COLLECTION

### MongoDB Schema & Validation

```javascript
// models/CollegeModel.js
const db = require('../config/db');
const { ObjectId } = require('mongodb');

class CollegeModel {
  /**
   * Initialize college collection with validation rules
   */
  static async initializeCollection() {
    const db_instance = db.getDB();
    
    try {
      await db_instance.createCollection('colleges', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'tier', 'establishment_type', 'location'],
            properties: {
              _id: { bsonType: 'objectId' },
              name: {
                bsonType: 'string',
                description: 'Full college name (unique)'
              },
              alias: {
                bsonType: 'array',
                items: { bsonType: 'string' },
                description: 'Alternate names for matching (e.g., "IIM B", "IIMB")'
              },
              tier: {
                enum: [
                  'Tier-1: IIM Blacki',
                  'Tier-1: IIM New Gen',
                  'Tier-1: IIM Baby',
                  'Tier-1: IIT MBA',
                  'Tier-2: Strategic Non-IIM',
                  'Tier-3: Traffic Drivers',
                  'Tier-4: Emerging'
                ],
                description: 'College tier classification'
              },
              establishment_type: {
                enum: ['Government', 'Private', 'Deemed', 'Autonomous'],
                description: 'Type of institution'
              },
              location: {
                bsonType: 'object',
                required: ['city', 'state', 'country'],
                properties: {
                  city: { bsonType: 'string' },
                  state: { bsonType: 'string' },
                  country: { bsonType: 'string', default: 'India' },
                  zip: { bsonType: 'string' },
                  campus_address: { bsonType: 'string' }
                }
              },
              avg_package: {
                bsonType: 'object',
                properties: {
                  total: { bsonType: 'double', description: 'In lakhs' },
                  median: { bsonType: 'double' },
                  base: { bsonType: 'double' },
                  international: { bsonType: 'double' },
                  currency: { bsonType: 'string', default: 'INR (Lakhs)' }
                }
              },
              recruitment_stats: {
                bsonType: 'object',
                properties: {
                  placement_rate: { bsonType: 'int' },
                  avg_base_salary: { bsonType: 'double' },
                  top_recruiter_packages: { bsonType: 'double' },
                  major_recruiters: { bsonType: 'array', items: { bsonType: 'string' } },
                  last_updated: { bsonType: 'date' }
                }
              },
              academics: {
                bsonType: 'object',
                properties: {
                  entrance_exam: { enum: ['CAT', 'XAT', 'GMAT', 'Multiple'] },
                  avg_entrance_score: { bsonType: 'double' },
                  program_duration_months: { bsonType: 'int' },
                  batch_size: { bsonType: 'int' },
                  cutoff_percentile: { bsonType: 'double' }
                }
              },
              social_metrics: {
                bsonType: 'object',
                properties: {
                  reddit_mentions_count: { bsonType: 'int', default: 0 },
                  controversy_count: { bsonType: 'int', default: 0 },
                  recent_news_count: { bsonType: 'int', default: 0 },
                  trending_score: { bsonType: 'double', default: 0 }
                }
              },
              contact_info: {
                bsonType: 'object',
                properties: {
                  phone: { bsonType: 'string' },
                  email: { bsonType: 'string' },
                  website: { bsonType: 'string' },
                  admission_email: { bsonType: 'string' }
                }
              },
              seo_tags: {
                bsonType: 'array',
                items: { bsonType: 'string' },
                description: 'For search optimization'
              },
              created_at: { bsonType: 'date' },
              updated_at: { bsonType: 'date' },
              is_active: { bsonType: 'bool', default: true },
              metadata: {
                bsonType: 'object',
                properties: {
                  wikipedia_link: { bsonType: 'string' },
                  mba_com_link: { bsonType: 'string' },
                  news_feed_url: { bsonType: 'string' },
                  established_year: { bsonType: 'int' }
                }
              }
            }
          }
        }
      });
      
      // Create indexes for performance
      const colleges_collection = db_instance.collection('colleges');
      await colleges_collection.createIndex({ name: 1 }, { unique: true });
      await colleges_collection.createIndex({ tier: 1 });
      await colleges_collection.createIndex({ 'location.city': 1 });
      await colleges_collection.createIndex({ alias: 1 });
      await colleges_collection.createIndex({ 'avg_package.total': -1 });
      await colleges_collection.createIndex({ 'social_metrics.trending_score': -1 });
      
      console.log('✓ Colleges collection initialized');
    } catch (err) {
      if (err.codeName !== 'NamespaceExists') {
        throw err;
      }
      console.log('✓ Colleges collection already exists');
    }
  }

  /**
   * Create a new college
   */
  static async create(collegeData) {
    const college = {
      ...collegeData,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
      social_metrics: {
        reddit_mentions_count: 0,
        controversy_count: 0,
        recent_news_count: 0,
        trending_score: 0
      }
    };
    return await db.insertOne('colleges', college);
  }

  /**
   * Find colleges by tier
   */
  static async findByTier(tier, limit = 20, offset = 0) {
    const colleges = db.getDB().collection('colleges');
    return await colleges
      .find({ tier, is_active: true })
      .sort({ 'avg_package.total': -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }

  /**
   * Find colleges by location
   */
  static async findByLocation(city, state = null) {
    const query = { 'location.city': city, is_active: true };
    if (state) query['location.state'] = state;
    
    const colleges = db.getDB().collection('colleges');
    return await colleges.find(query).toArray();
  }

  /**
   * Search colleges by name or alias
   */
  static async search(searchTerm) {
    const colleges = db.getDB().collection('colleges');
    const regex = new RegExp(searchTerm, 'i');
    
    return await colleges
      .find({
        $or: [
          { name: regex },
          { alias: regex }
        ],
        is_active: true
      })
      .limit(20)
      .toArray();
  }

  /**
   * Get trending colleges (by social metrics)
   */
  static async getTrending(limit = 10) {
    const colleges = db.getDB().collection('colleges');
    return await colleges
      .find({ is_active: true })
      .sort({ 'social_metrics.trending_score': -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Update social metrics (called after scraping)
   */
  static async updateSocialMetrics(collegeId, metrics) {
    const update = {
      $set: {
        'social_metrics.recent_news_count': metrics.recent_news_count || 0,
        'social_metrics.reddit_mentions_count': metrics.reddit_mentions_count || 0,
        'social_metrics.controversy_count': metrics.controversy_count || 0,
        'social_metrics.trending_score': metrics.trending_score || 0,
        updated_at: new Date()
      }
    };
    
    if (typeof collegeId === 'string') {
      collegeId = new ObjectId(collegeId);
    }
    
    return await db.updateOne('colleges', { _id: collegeId }, update);
  }

  /**
   * Get college by ID (for detail page)
   */
  static async findById(collegId) {
    if (typeof collegeId === 'string') {
      collegeId = new ObjectId(collegeId);
    }
    return await db.findOne('colleges', { _id: collegeId });
  }

  /**
   * Find college by name (for scraper to tag articles)
   */
  static async findByNameOrAlias(name) {
    const colleges = db.getDB().collection('colleges');
    
    // Exact match first
    let college = await colleges.findOne({ name: name });
    if (college) return college;

    // Alias match
    college = await colleges.findOne({ alias: name });
    if (college) return college;
    
    // Fuzzy match (case-insensitive)
    const regex = new RegExp(`^${name}$`, 'i');
    college = await colleges.findOne({ 
      $or: [
        { name: regex },
        { alias: regex }
      ]
    });
    
    return college;
  }
}

module.exports = CollegeModel;
```

---

## 2. NEWS ARTICLES COLLECTION

### MongoDB Schema

```javascript
// models/NewsArticleModel.js
const db = require('../config/db');
const { ObjectId } = require('mongodb');

class NewsArticleModel {
  /**
   * Initialize news_articles collection
   */
  static async initializeCollection() {
    const db_instance = db.getDB();
    
    try {
      await db_instance.createCollection('news_articles', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'college_ids', 'source'],
            properties: {
              _id: { bsonType: 'objectId' },
              title: {
                bsonType: 'string',
                description: 'Article headline'
              },
              content: {
                bsonType: 'string',
                description: 'Full article text'
              },
              summary: {
                bsonType: 'string',
                description: '200-char preview'
              },
              content_type: {
                enum: [
                  'placement_stats',
                  'controversy',
                  'ragging',
                  'general_news',
                  'reddit_discussion',
                  'admissions',
                  'academic'
                ],
                description: 'Content classification'
              },
              college_ids: {
                bsonType: 'array',
                items: { bsonType: 'objectId' },
                description: 'References to colleges'
              },
              college_names: {
                bsonType: 'array',
                items: { bsonType: 'string' },
                description: 'Denormalized for quick filters'
              },
              source: {
                bsonType: 'object',
                required: ['name', 'url', 'platform'],
                properties: {
                  name: { bsonType: 'string' },
                  url: { bsonType: 'string' },
                  author: { bsonType: 'string' },
                  platform: { enum: ['reddit', 'news_site', 'institutional', 'other'] }
                }
              },
              sentiment: {
                enum: ['positive', 'negative', 'neutral', 'mixed'],
                description: 'Sentiment of the article'
              },
              keywords: {
                bsonType: 'array',
                items: { bsonType: 'string' }
              },
              engagement_metrics: {
                bsonType: 'object',
                properties: {
                  reddit_score: { bsonType: 'int', default: 0 },
                  reddit_comments: { bsonType: 'int', default: 0 },
                  upvotes: { bsonType: 'int', default: 0 },
                  shares: { bsonType: 'int', default: 0 },
                  views: { bsonType: 'int', default: 0 }
                }
              },
              category: {
                bsonType: 'object',
                properties: {
                  primary: { bsonType: 'string' },
                  secondary: { bsonType: 'array', items: { bsonType: 'string' } }
                }
              },
              published_at: { bsonType: 'date' },
              scraped_at: { bsonType: 'date' },
              created_at: { bsonType: 'date' },
              is_verified: { bsonType: 'bool', default: false },
              is_featured: { bsonType: 'bool', default: false },
              is_duplicate: { bsonType: 'bool', default: false },
              duplicate_of: { bsonType: 'objectId' },
              metadata: {
                bsonType: 'object',
                properties: {
                  source_id: { bsonType: 'string' },
                  image_url: { bsonType: 'string' },
                  original_url: { bsonType: 'string' }
                }
              }
            }
          }
        }
      });
      
      // Create indexes
      const articles_collection = db_instance.collection('news_articles');
      await articles_collection.createIndex({ college_ids: 1 });
      await articles_collection.createIndex({ published_at: -1 });
      await articles_collection.createIndex({ 'engagement_metrics.reddit_score': -1 });
      await articles_collection.createIndex({ content_type: 1 });
      await articles_collection.createIndex({ is_duplicate: 1 });
      await articles_collection.createIndex({ 'source.url': 1 }, { unique: true });
      await articles_collection.createIndex({ title: 'text', content: 'text' });
      
      console.log('✓ News articles collection initialized');
    } catch (err) {
      if (err.codeName !== 'NamespaceExists') {
        throw err;
      }
      console.log('✓ News articles collection already exists');
    }
  }

  /**
   * Create an article from scraper
   */
  static async create(articleData) {
    const article = {
      ...articleData,
      created_at: new Date(),
      scraped_at: new Date(),
      is_verified: false,
      is_duplicate: false
    };
    
    const result = await db.insertOne('news_articles', article);
    return { _id: result.insertedId, ...article };
  }

  /**
   * Get articles by college (with pagination)
   */
  static async getByCollege(collegeId, contentType = null, limit = 20, offset = 0) {
    if (typeof collegeId === 'string') {
      collegeId = new ObjectId(collegeId);
    }

    const query = { 
      college_ids: collegeId,
      is_duplicate: false
    };

    if (contentType) {
      query.content_type = contentType;
    }

    const articles = db.getDB().collection('news_articles');
    const total = await articles.countDocuments(query);
    
    const data = await articles
      .find(query)
      .sort({ published_at: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    return { data, total };
  }

  /**
   * Get trending articles (by Reddit engagement)
   */
  static async getTrending(timeframe = 'week', limit = 20) {
    const articles = db.getDB().collection('news_articles');
    
    const daysAgo = {
      'week': 7,
      'month': 30,
      'all_time': 365
    }[timeframe] || 7;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    return await articles
      .find({
        published_at: { $gte: cutoffDate },
        is_duplicate: false
      })
      .sort({ 'engagement_metrics.reddit_score': -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Search articles (full-text search)
   */
  static async search(query, limit = 20) {
    const articles = db.getDB().collection('news_articles');
    
    return await articles
      .find({
        $text: { $search: query },
        is_duplicate: false
      })
      .limit(limit)
      .toArray();
  }

  /**
   * Mark article as duplicate
   */
  static async markAsDuplicate(articleId, duplicateOfId) {
    if (typeof articleId === 'string') {
      articleId = new ObjectId(articleId);
    }
    if (typeof duplicateOfId === 'string') {
      duplicateOfId = new ObjectId(duplicateOfId);
    }

    return await db.updateOne('news_articles', { _id: articleId }, {
      $set: {
        is_duplicate: true,
        duplicate_of: duplicateOfId
      }
    });
  }

  /**
   * Update engagement metrics
   */
  static async updateEngagement(articleId, metrics) {
    if (typeof articleId === 'string') {
      articleId = new ObjectId(articleId);
    }

    return await db.updateOne('news_articles', { _id: articleId }, {
      $set: {
        'engagement_metrics': metrics
      }
    });
  }

  /**
   * Mark article as verified (manual review)
   */
  static async markAsVerified(articleId) {
    if (typeof articleId === 'string') {
      articleId = new ObjectId(articleId);
    }

    return await db.updateOne('news_articles', { _id: articleId }, {
      $set: { is_verified: true }
    });
  }
}

module.exports = NewsArticleModel;
```

---

## 3. UPDATED USERS COLLECTION

### MongoDB Schema (Simplified)

```javascript
// models/UserModel.js (UPDATED)

class UserModel {
  /**
   * Updated: Make profile optional
   */
  static async create(email, phone = null) {
    const user = {
      email,
      phone,
      is_verified: false,
      // OPTIONAL PROFILE SECTION
      profile: {
        acad_10th: null,
        acad_12th: null,
        acad_grad: null,
        acad_stream: null,
        current_company: null,
        work_ex_months: 0,
        completed: false
      },
      preferences: {
        bookmarked_articles: [],
        favorite_colleges: [],
        interested_tiers: []
      },
      anonymous_session_id: null,
      created_at: new Date(),
      last_login: null,
      updated_at: new Date()
    };
    return await db.insertOne('users', user);
  }

  /**
   * Update OPTIONAL profile (partial updates allowed)
   */
  static async updateProfile(userId, profileData) {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }

    const update = { $set: {} };

    // Only update provided fields
    if (profileData.acad_10th !== undefined) update.$set['profile.acad_10th'] = profileData.acad_10th;
    if (profileData.acad_12th !== undefined) update.$set['profile.acad_12th'] = profileData.acad_12th;
    if (profileData.acad_grad !== undefined) update.$set['profile.acad_grad'] = profileData.acad_grad;
    if (profileData.acad_stream !== undefined) update.$set['profile.acad_stream'] = profileData.acad_stream;
    if (profileData.current_company !== undefined) update.$set['profile.current_company'] = profileData.current_company;
    if (profileData.work_ex_months !== undefined) update.$set['profile.work_ex_months'] = profileData.work_ex_months;

    // Mark profile as complete only if all marks provided
    const allMarksProvided = 
      profileData.acad_10th !== undefined &&
      profileData.acad_12th !== undefined &&
      profileData.acad_grad !== undefined;

    update.$set['profile.completed'] = allMarksProvided;
    update.$set['updated_at'] = new Date();

    return await db.updateOne('users', { _id: userId }, update);
  }

  /**
   * Add bookmark
   */
  static async addBookmark(userId, articleId) {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    if (typeof articleId === 'string') {
      articleId = new ObjectId(articleId);
    }

    return await db.updateOne('users', { _id: userId }, {
      $addToSet: { 'preferences.bookmarked_articles': articleId }
    });
  }

  /**
   * Remove bookmark
   */
  static async removeBookmark(userId, articleId) {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    if (typeof articleId === 'string') {
      articleId = new ObjectId(articleId);
    }

    return await db.updateOne('users', { _id: userId }, {
      $pull: { 'preferences.bookmarked_articles': articleId }
    });
  }

  /**
   * Add favorite college
   */
  static async addFavoriteCollege(userId, collegeId) {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    if (typeof collegeId === 'string') {
      collegeId = new ObjectId(collegeId);
    }

    return await db.updateOne('users', { _id: userId }, {
      $addToSet: { 'preferences.favorite_colleges': collegeId }
    });
  }

  /**
   * Get bookmarks
   */
  static async getBookmarks(userId) {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }

    const user = await db.findOne('users', { _id: userId });
    if (!user) return [];

    // Populate articles
    const articles = db.getDB().collection('news_articles');
    return await articles
      .find({ _id: { $in: user.preferences.bookmarked_articles } })
      .toArray();
  }
}

module.exports = UserModel;
```

---

## 4. SCRAPER LOGS COLLECTION

### MongoDB Schema

```javascript
// models/ScraperLogModel.js
const db = require('../config/db');

class ScraperLogModel {
  static async logScraperRun(scraperName, source, status, results) {
    const log = {
      scraper_name: scraperName,
      source: source,
      status: status,  // 'success' | 'failed' | 'partial'
      articles_found: results.found || 0,
      articles_ingested: results.ingested || 0,
      run_timestamp: new Date(),
      next_run_scheduled: results.nextRun || null,
      error_log: results.error || null,
      execution_time_ms: results.executionTime || 0,
      metadata: results.metadata || {}
    };

    return await db.insertOne('scraper_logs', log);
  }

  static async getLastRun(scraperName) {
    const logs = db.getDB().collection('scraper_logs');
    return await logs
      .findOne({ scraper_name: scraperName })
      .sort({ run_timestamp: -1 });
  }

  static async getRunHistory(scraperName, limit = 10) {
    const logs = db.getDB().collection('scraper_logs');
    return await logs
      .find({ scraper_name: scraperName })
      .sort({ run_timestamp: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = ScraperLogModel;
```

---

## 5. SEED DATA SCRIPT

### College Database Initialization

```javascript
// scripts/seed-colleges.js
const db = require('../config/db');
const CollegeModel = require('../models/CollegeModel');

const COLLEGES_SEED_DATA = [
  // ========== TIER-1: IIM BLACKI (Top 5) ==========
  {
    name: 'IIM Ahmedabad',
    alias: ['IIM A', 'IIMA', 'Ahmedabad'],
    tier: 'Tier-1: IIM Blacki',
    establishment_type: 'Government',
    location: {
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India'
    },
    avg_package: {
      total: 28.5,
      median: 27.0,
      base: 22.0,
      international: 45.0,
      currency: 'INR (Lakhs)'
    },
    recruitment_stats: {
      placement_rate: 100,
      avg_base_salary: 22.0,
      top_recruiter_packages: 2.5,
      major_recruiters: ['McKinsey', 'BCG', 'Bain', 'Amazon', 'Microsoft']
    },
    academics: {
      entrance_exam: 'CAT',
      avg_entrance_score: 99.5,
      program_duration_months: 24,
      batch_size: 400,
      cutoff_percentile: 99.0
    },
    seo_tags: ['IIM', 'MBA', 'Ahmedabad', 'Tier-1'],
    contact_info: {
      phone: '+91-79-6632-4444',
      email: 'admission@iimahd.ac.in',
      website: 'www.iimahd.ac.in'
    },
    metadata: {
      established_year: 1961,
      wikipedia_link: 'https://en.wikipedia.org/wiki/Indian_Institute_of_Management,_Ahmedabad'
    }
  },
  {
    name: 'IIM Bangalore',
    alias: ['IIM B', 'IIMB', 'Bangalore'],
    tier: 'Tier-1: IIM Blacki',
    establishment_type: 'Government',
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India'
    },
    avg_package: {
      total: 29.8,
      median: 28.0,
      base: 23.0,
      international: 48.0,
      currency: 'INR (Lakhs)'
    },
    recruitment_stats: {
      placement_rate: 100,
      avg_base_salary: 23.0,
      top_recruiter_packages: 2.65,
      major_recruiters: ['McKinsey', 'BCG', 'Bain', 'Google', 'Amazon']
    },
    academics: {
      entrance_exam: 'CAT',
      avg_entrance_score: 99.5,
      program_duration_months: 24,
      batch_size: 450,
      cutoff_percentile: 98.5
    },
    seo_tags: ['IIM', 'MBA', 'Bangalore', 'Tier-1'],
    contact_info: {
      phone: '+91-80-6691-9000',
      email: 'pgp@iimb.ac.in',
      website: 'www.iimb.ac.in'
    },
    metadata: {
      established_year: 1973
    }
  },
  // ADD MORE COLLEGES HERE...
  // Tier-1: IIM Calcutta, Lucknow, Kozhikode
  // Tier-1: IIM New Gen (Indore, Shillong, Rohtak, Ranchi, Raipur, Trichy, Udaipur, Kashipur)
  // Tier-1: IIM Baby (Nagpur, Amritsar, Bodh Gaya, Jammu, Sambalpur, Sirmaur, Visakhapatnam)
  // Tier-1: IIT MBAs (Bombay, Delhi, Kharagpur, Roorkee, Kanpur, Madras, Jodhpur)
  // Tier-2: XLRI, ISB, MDI, etc.
  // Tier-3: NMIMS, SIBM, etc.
];

const seedColleges = async () => {
  try {
    await db.connect();
    await CollegeModel.initializeCollection();

    console.log('Seeding colleges database...');
    
    for (const collegeData of COLLEGES_SEED_DATA) {
      try {
        await CollegeModel.create(collegeData);
        console.log(`✓ Seeded: ${collegeData.name}`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`⊘ Already exists: ${collegeData.name}`);
        } else {
          console.error(`✗ Error seeding ${collegeData.name}:`, err);
        }
      }
    }

    console.log('✓ Colleges database seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed colleges:', error);
    process.exit(1);
  }
};

seedColleges();
```

---

## 6. DATABASE MIGRATIONS CHECKLIST

### Existing Collections (Remove/Deprecate)
- [ ] Archive `gd_topics` collection (used for war room)
- [ ] Archive `pi_experiences` collection
- [ ] Keep historical data (don't delete)

### New Collections to Create
- [ ] `colleges` ✓
- [ ] `news_articles` ✓
- [ ] `scraper_logs` ✓
- [ ] `college_tiers` (optional, can be data within colleges)

### Updates to Existing Collections
- [ ] `users` - Add optional profile structure ✓
- [ ] `users.preferences` - Add bookmarks & favorite colleges ✓

---

## 7. INDEX STRATEGY FOR PERFORMANCE

### colleges indexes
```javascript
{ name: 1 } // unique
{ tier: 1 } // tier filtering
{ 'location.city': 1 } // location filtering
{ alias: 1 } // for scraper matching
{ 'avg_package.total': -1 } // sorting by package
{ 'social_metrics.trending_score': -1 } // trending queries
```

### news_articles indexes
```javascript
{ college_ids: 1 } // find articles for a college
{ published_at: -1 } // recent articles
{ 'engagement_metrics.reddit_score': -1 } // trending
{ content_type: 1 } // filter by type
{ is_duplicate: 1 } // exclude duplicates
{ 'source.url': 1 } // unique (prevent duplicates)
{ title: 'text', content: 'text' } // full-text search
```

### users indexes
```javascript
{ email: 1 } // unique, login
{ 'preferences.bookmarked_articles': 1 } // get bookmarks
```

---

## 8. IMPLEMENTATION CHECKLIST

### Phase 1: Database Setup
- [ ] Create CollegeModel with schema validation
- [ ] Create NewsArticleModel with schema validation
- [ ] Update UserModel for optional profile
- [ ] Create ScraperLogModel
- [ ] Create seed script for 60+ colleges
- [ ] Run seed script to populate initial data
- [ ] Verify indexes are created

### Phase 2: Validation
- [ ] Test college search & filtering
- [ ] Test article creation & retrieval
- [ ] Test scraper logging
- [ ] Test user bookmark functionality
- [ ] Stress test with 500+ articles

**Status:** Ready for implementation

