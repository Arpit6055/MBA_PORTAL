#!/usr/bin/env node

/**
 * Database Reset Script
 * WARNING: Drops all collections and reinitializes database
 * Run: npm run reset-db
 */

require('dotenv').config();
const db = require('../config/db');

async function resetDatabase() {
  try {
    console.log('⚠️  Starting Database Reset...\n');

    // Connect to database
    const connection = await db.connect();

    // Get all collections
    const collections = await connection.listCollections().toArray();
    console.log(`Found ${collections.length} collections to drop\n`);

    // Drop each collection
    for (const collection of collections) {
      await connection.db.dropCollection(collection.name);
      console.log(`✓ Dropped collection: ${collection.name}`);
    }

    console.log('\n🚀 Reinitializing database...');
    await runInitDb();

    console.log('\n✅ Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Reset error:', error.message);
    process.exit(1);
  }
}

async function runInitDb() {
  // Dynamically require init-db logic
  const initDb = require('./init-db.js');
  // Note: init-db.js will handle the reinitalization
}

resetDatabase();
