#!/usr/bin/env node

/**
 * Database Initialization Script
 * Run: node scripts/init-db.js
 * Creates MongoDB collections if they don't exist, skips if they do
 */

require('dotenv').config();
const db = require('../config/db');

async function initializeDatabase() {
  try {
    console.log('🚀 Starting MongoDB Collection Initialization...\n');

    // Connect to database
    await db.connect();

    // Define collections with their indexes
    const collections = [
      {
        name: 'users',
        indexes: {
          email: { unique: true },
          created_at: {},
        },
      },
      {
        name: 'otps',
        indexes: {
          email: {},
          expires_at: {},
        },
      },
      {
        name: 'work_experience',
        indexes: {
          email: {},
          created_at: {},
        },
      },
      {
        name: 'target_colleges',
        indexes: {
          email: {},
        },
      },
      {
        name: 'gd_topics',
        indexes: {
          category: {},
          created_at: {},
        },
      },
      {
        name: 'interview_experiences',
        indexes: {
          email: {},
          college_name: {},
          created_at: {},
        },
      },
      {
        name: 'roi_calculations',
        indexes: {
          email: {},
          created_at: {},
        },
      },
      {
        name: 'sessions',
        indexes: {
          expire: {},
        },
      },
    ];

    // Create each collection
    for (const collection of collections) {
      await db.createCollection(collection.name, collection.indexes);
    }

    console.log('\n✅ MongoDB collection initialization completed successfully!');
    console.log('\n📊 Created/Verified collections:');
    collections.forEach(col => {
      console.log(`   ✓ ${col.name}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
