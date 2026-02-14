
/**
 * Script to clear all articles from the news_articles collection.
 */
require('dotenv').config();
const db = require('../config/db');

async function clearArticles() {
  try {
    console.log('Connecting to database...');
    await db.connect();
    const database = db.getDB();
    
    console.log('Clearing news_articles collection...');
    const result = await database.collection('news_articles').deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} articles.`);
    
  } catch (error) {
    console.error('Error clearing articles:', error);
  } finally {
    await db.close();
  }
}

clearArticles();
