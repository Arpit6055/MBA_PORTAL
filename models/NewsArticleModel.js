/**
 * News Article Model
 * Database schema and operations for news articles
 */

const db = require('../config/db');

class NewsArticleModel {
  /**
   * Create a new article
   */
  static async create(articleData) {
    const database = db.getDB();
    
    // Ensure created_at timestamp
    const article = {
      ...articleData,
      created_at: new Date(),
    };

    const result = await database.collection('news_articles').insertOne(article);
    return result;
  }

  /**
   * Find article by URL
   */
  static async findByUrl(url) {
    const database = db.getDB();
    const article = await database.collection('news_articles').findOne({ 
      'source.url': url 
    });
    return article;
  }

  /**
   * Find articles by college
   */
  static async findByCollege(collegeName) {
    const database = db.getDB();
    const articles = await database.collection('news_articles').find({ 
      college_names: collegeName 
    }).toArray();
    return articles;
  }

  /**
   * Get recent articles
   */
  static async getRecent(limit = 50) {
    const database = db.getDB();
    const articles = await database.collection('news_articles')
      .find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();
    return articles;
  }

  /**
   * Count articles
   */
  static async count() {
    const database = db.getDB();
    return await database.collection('news_articles').countDocuments();
  }
}

module.exports = NewsArticleModel;
