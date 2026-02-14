#!/usr/bin/env node

/**
 * Data Deduplication Script
 * Removes duplicate entries from scraped data
 * Run: npm run scrape:dedup
 */

require('dotenv').config();
const db = require('../config/db');
const NewsArticleModel = require('../models/NewsArticleModel');

/**
 * Calculate string similarity (0-1)
 * Uses simple character overlap method for speed
 */
function stringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // If strings are identical
  if (s1 === s2) return 1;
  
  // If one is contained in the other (partial match)
  if (s1.includes(s2) || s2.includes(s1)) {
    return Math.max(s1.length, s2.length) / (Math.min(s1.length, s2.length) * 1.5);
  }
  
  // Levenshtein-like distance (simplified)
  const maxLen = Math.max(s1.length, s2.length);
  let matches = 0;
  
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++;
  }
  
  return matches / maxLen;
}

async function deduplicateData() {
  const startTime = Date.now();
  let duplicatesFound = 0;
  let mergedRecords = 0;

  try {
    console.log('🧹 Starting Data Deduplication...\n');

    // Connect to database
    await db.connect();

    // Get all articles
    const database = await db.connect();
    const articles = await database.collection('news_articles')
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    console.log(`   Found ${articles.length} articles to check`);

    // Compare articles for duplicates
    const processed = new Set();
    const duplicates = [];

    for (let i = 0; i < articles.length; i++) {
      if (processed.has(articles[i]._id.toString())) continue;

      for (let j = i + 1; j < articles.length; j++) {
        if (processed.has(articles[j]._id.toString())) continue;

        // Compare titles via similarity
        const titleSimilarity = stringSimilarity(articles[i].title, articles[j].title);
        const urlMatch = articles[i].source?.url === articles[j].source?.url;

        // If duplicate detected
        if (urlMatch || titleSimilarity > 0.85) {
          duplicatesFound++;
          processed.add(articles[j]._id.toString());
          duplicates.push(articles[j]._id);

          console.log(`   ✓ Duplicate found: "${articles[j].title.substring(0, 50)}..."`);
        }
      }
      
      processed.add(articles[i]._id.toString());
    }

    // Remove duplicates
    if (duplicates.length > 0) {
      const deleteResult = await database.collection('news_articles').deleteMany({
        _id: { $in: duplicates }
      });
      
      mergedRecords = deleteResult.deletedCount || 0;
      console.log(`\n   🗑️  Deleted ${mergedRecords} duplicate records`);
    }

    const executionTime = Date.now() - startTime;
    console.log(`\n✓ Duplicates found: ${duplicatesFound}`);
    console.log(`✓ Records merged: ${mergedRecords}`);
    console.log(`⏱ Execution time: ${executionTime}ms`);

    console.log('\n✅ Deduplication completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Deduplication error:', error.message);
    process.exit(1);
  }
}

deduplicateData();
