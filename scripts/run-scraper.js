#!/usr/bin/env node

/**
 * Master Scraper Script (Unified)
 * Runs the official college data scraper
 * Run: npm run scrape
 */

require('dotenv').config();
const { exec } = require('child_process');
const db = require('../config/db');

async function runAllScrapers() {
  try {
    console.log('⏳ Starting College Data Scraper (Placement + Admission + Fees)...\n');

    // Connect to database
    await db.connect();

    // Run the unified college data scraper
    console.log('🎓 [1/1] Scraping Official College Data...');
    await runScript('node scripts/scrape-college-data.js');

    console.log('\n✅ All scrapers completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Scraper error:', error.message);
    process.exit(1);
  }
}

function runScript(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
      }
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      resolve();
    });
  });
}

runAllScrapers();
