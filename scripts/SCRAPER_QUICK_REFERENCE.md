# Web Scraper - Quick Reference Guide

## 🚀 Quick Start

### Installation & Setup

1. **Verify dependencies are installed:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Add to .env file
   NEWS_API_KEY=your_key_from_newsapi.org
   MONGODB_URI=your_mongodb_connection
   ```

3. **Initialize database:**
   ```bash
   npm run init-db
   ```

---

## 📰 Running the Scrapers

### Option 1: Advanced Scrapers (Recommended - NEW!)

**News Scraper (14 sources, controversy detection):**
```bash
npm run scrape:news-advanced
```
- Fetches from 14 premium news sources
- Includes NewsAPI with 10 specialized queries
- Filters for quality, relevance, engagement
- Execution time: 30-60 seconds
- Expected ingestion: 50-100 articles

**Reddit Scraper (13 subreddits):**
```bash
npm run scrape:reddit-advanced
```
- Scrapes 13 MBA-focused subreddits
- Detects controversies and engagement value
- Prioritizes high-quality discussions
- Execution time: 20-40 seconds
- Expected ingestion: 100-200 posts

**Both Scrapers (Sequential):**
```bash
npm run scrape:all-advanced
```
- Runs news scraper, then Reddit scraper
- Total time: 1-2 minutes
- Total ingestion: 150-300 articles

---

### Option 2: Original Scrapers

**Individual scrapers:**
```bash
npm run scrape:news         # Original news scraper
npm run scrape:reddit       # Original Reddit scraper
npm run scrape:poetsandquants
npm run scrape:dedup        # Find & mark duplicates
```

**All original scrapers:**
```bash
npm run scrape:all          # Runs all original scrapers + dedup
```

---

## 📊 What's Different About Advanced Scrapers?

### News Sources (Advanced)
| Tier | Sources | Count |
|------|---------|-------|
| Premium News | The Hindu, ET, LiveMint, IE, TOI | 5 |
| MBA-Specific | Poets & Quants, MBA.com | 2 |
| CAT/MBA Portal | CAT Portal, MBA Crystal Ball | 2 |
| Specialized | InsideIIM, ClearAdmit, GMAC, Deccan, Telegraph, Hindi, DNA | 7 |
| **Total** | | **16+** |

### New AI Classification
- ✅ Controversy detection (ragging, fraud, etc.)
- ✅ Placement statistics tracking
- ✅ Admission cutoff info
- ✅ Academic review labeling
- ✅ Experience/interview prep content
- ✅ Ranking & comparison articles
- ✅ GD/debate discussion value

### Quality Filtering
- ✅ Minimum 100 characters content
- ✅ Spam/clickbait removal
- ✅ College mention requirement
- ✅ Engagement threshold
- ✅ Duplication check

---

## 💡 Understanding the Output

### Article Fields (Database)

After running scrapers, articles are stored with:

```javascript
{
  // Core content
  title: "IIM placement season 2024 begins",
  content: "Full article text...",
  summary: "Short summary...",
  
  // Source tracking
  source: {
    name: "Economic Times",
    url: "https://...",
    author: "John Doe",
    platform: "news_api" // or "web_scrape" or "reddit"
  },
  
  // College tagging (MOST IMPORTANT)
  college_names: ["IIM Bangalore", "IIM Ahmedabad"],
  
  // Classification
  content_type: "placement",  // or "controversy", "admission", etc.
  category: {
    primary: "placement",
    secondary: ["ranking"]    // optional secondary tags
  },
  
  // Sentiment
  sentiment: "positive",  // positive, negative, or neutral
  
  // Engagement (for Reddit)
  engagement_metrics: {
    reddit_score: 256,      // upvotes
    reddit_comments: 42,
    subreddit: "MBA",
    subreddit_priority: 10  // 1-10, higher = better
  },
  
  // Quality indicators
  quality_indicators: {
    quality_score: 7.8,           // 0-10
    engagement_value: 12.5,
    controversy_level: "high",    // none, medium, high, critical
    controversy_score: 3          // keyword matches
  },
  
  // Metadata
  published_at: "2026-02-14T10:30:00Z",
  image_url: "https://...",       // for news articles
  created_at: "2026-02-14T10:35:00Z"
}
```

---

## 🎯 Filtering/Searching Articles

### By College
```bash
# View articles for specific college
db.news_articles.find({ college_names: "IIM Ahmedabad" })
```

### By Content Type
```bash
# Find all controversy articles
db.news_articles.find({ "category.primary": "controversy" })

# Find placement news
db.news_articles.find({ "category.primary": "placement" })
```

### By Controversy Level
```bash
# Critical controversies only
db.news_articles.find({ 
  "quality_indicators.controversy_level": { $in: ["critical", "high"] }
})
```

### By Source
```bash
# Articles from Reddit
db.news_articles.find({ "source.platform": "reddit" })

# Articles from news sites
db.news_articles.find({ "source.platform": "web_scrape" })
```

### High-Quality Articles
```bash
# Quality score > 7
db.news_articles.find({ 
  "quality_indicators.quality_score": { $gt: 7 }
})
```

---

## 📅 Scheduling Scrapers

### Add to Cron (Linux/Mac)

**Edit crontab:**
```bash
crontab -e
```

**Add these lines:**
```bash
# Run advanced news scraper every 12 hours at 0500 and 1700
0 5,17 * * * cd /path/to/project && npm run scrape:news-advanced >> logs/scraper.log 2>&1

# Run advanced Reddit scraper every 6 hours
0 */6 * * * cd /path/to/project && npm run scrape:reddit-advanced >> logs/scraper.log 2>&1

# Run deduplication daily at 0200
0 2 * * * cd /path/to/project && npm run scrape:dedup >> logs/scraper.log 2>&1
```

### Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 5 AM)
4. Action:
   ```
   Program: C:\Program Files\nodejs\node.exe
   Arguments: C:\path\to\scripts\scrape-news-advanced.js
   Start in: C:\path\to\project
   ```

---

## 🔍 Monitoring & Troubleshooting

### Check last scraper run
```bash
npm run health
# or manually query:
db.scraper_logs.findOne({}, { sort: { run_timestamp: -1 } })
```

### View article statistics
```javascript
// In MongoDB shell
db.news_articles.aggregate([
  { $group: { 
      _id: "$content_type", 
      count: { $sum: 1 }
  }},
  { $sort: { count: -1 }}
])
```

### Debug scraper issues

**NewsAPI key missing:**
```
⚠️  NEWS_API_KEY not configured. Skipping NewsAPI.
→ Add NEWS_API_KEY to .env file
```

**College mentions not found:**
```
❌ 0 colleges mentioned in article
→ Verify college names have aliases in database
→ Run college matcher test
```

**Timeout errors:**
```
✗ Error scraping source: ECONNREFUSED
→ Check internet connection
→ Verify source website is accessible
→ Try again (temporary network issue)
```

---

## 📈 Analytics Dashboard

### Create a dashboard view (example)

```javascript
// Get scraper statistics
async function getScraperStats() {
  const stats = {
    // Total articles
    total_articles: await db.news_articles.countDocuments(),
    
    // By content type
    by_type: await db.news_articles.aggregate([
      { $group: { _id: "$content_type", count: { $sum: 1 }}}
    ]).toArray(),
    
    // By source platform
    by_platform: await db.news_articles.aggregate([
      { $group: { _id: "$source.platform", count: { $sum: 1 }}}
    ]).toArray(),
    
    // Controversial articles
    controversies: await db.news_articles.countDocuments({
      "quality_indicators.controversy_level": { $in: ["critical", "high"] }
    }),
    
    // Last 7 days
    recent: await db.news_articles.countDocuments({
      published_at: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
    }),
    
    // College coverage
    colleges_covered: (await db.news_articles.distinct("college_names")).length,
    
    // Average quality
    avg_quality: (await db.news_articles.aggregate([
      { $group: { _id: null, avg: { $avg: "$quality_indicators.quality_score" }}}
    ]).toArray())[0].avg
  };
  
  return stats;
}
```

---

## 🎓 Common Use Cases

### Use Case 1: Find Latest Controversy
```bash
db.news_articles.find({
  "quality_indicators.controversy_level": { $in: ["critical", "high"] }
}).sort({ published_at: -1 }).limit(5)
```

### Use Case 2: College-Specific News Feed
```bash
db.news_articles.find({
  college_names: "IIM Bangalore"
}).sort({ published_at: -1 }).limit(20)
```

### Use Case 3: Top Engagement Posts
```bash
db.news_articles.find({
  "source.platform": "reddit"
}).sort({ "engagement_metrics.reddit_score": -1 }).limit(10)
```

### Use Case 4: High-Quality Placement News
```bash
db.news_articles.find({
  "category.primary": "placement",
  "quality_indicators.quality_score": { $gte: 7 }
}).sort({ published_at: -1 }).limit(10)
```

---

## ⚙️ Configuration Tips

### Increase Coverage (Faster Ingestion)
1. Lower quality score threshold (0-10 scale)
2. Add more news sources
3. Increase posts per subreddit (from 100 to 150)

### Increase Quality (Fewer Articles)
1. Raise quality score threshold
2. Require higher engagement (comments/upvotes)
3. Remove lower-tier sources

### Focus on Controversies
```javascript
// In advanced scrapers, boost controversy weight:
CONTENT_CLASSIFIERS.controversy.weight = 2.0; // was 1.5x
```

### Add Custom Source
Edit `scrape-news-advanced.js`:
```javascript
SOURCES.manual_sources.push({
  name: 'YourNewsSite',
  url: 'https://newssite.com/mba',
  selector: 'article, .post',
  enabled: true
});
```

---

## 📚 Resources

- **NewsAPI Docs:** https://newsapi.org/docs
- **Reddit API:** https://www.reddit.com/dev/api
- **MongoDB Queries:** https://docs.mongodb.com/manual/
- **Advanced Scraper Guide:** See `docs/ADVANCED_SCRAPER_GUIDE.md`

---

**Last Updated:** Feb 2026  
**Version:** 2.0 (Advanced Scrapers)
