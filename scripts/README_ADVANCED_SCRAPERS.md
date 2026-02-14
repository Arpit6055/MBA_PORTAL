# Advanced Web Scrapers - README

## 🎯 What's New?

This directory contains **upgraded scraper scripts** with significantly improved:
- **Coverage**: 15+ news sources + 13 subreddits (was 3+3)
- **Quality**: 4-level filtering pipeline  
- **Intelligence**: Controversy detection, 8-category classification
- **Engagement**: Tracks comments, upvotes, and content quality
- **Documentation**: 3 comprehensive guides

---

## 📦 Files in This Directory

### Core Scrapers (New)
- **`scrape-news-advanced.js`** - Multi-source news aggregator with controversy detection
- **`scrape-reddit-advanced.js`** - 13-subreddit Reddit discussion scraper  

### Original Scrapers (Still Available)
- `scrape-news.js` - Original NewsAPI scraper
- `scrape-reddit.js` - Original Reddit scraper
- `scrape-poetsandquants.js` - Poets & Quants scraper
- Various utilities and helpers

### Documentation
- **`SCRAPER_QUICK_REFERENCE.md`** ← **START HERE** for commands
- `SCRIPTS_GUIDE.md` - Original guide (archive)

---

## 🚀 Quick Start (3 Steps)

### 1. Install & Setup
```bash
npm install
# Set NEWS_API_KEY in .env file
npm run init-db
```

### 2. Run Advanced Scrapers
```bash
# Individual:
npm run scrape:news-advanced      # 30-60 seconds
npm run scrape:reddit-advanced     # 20-40 seconds

# Or both together:
npm run scrape:all-advanced        # 1-2 minutes
```

### 3. Verify Results
```javascript
// In MongoDB:
db.news_articles.findOne()  // See article structure
```

---

## 📚 Documentation Guide

| Need | Document | Purpose |
|------|----------|---------|
| **Commands & Usage** | `SCRAPER_QUICK_REFERENCE.md` | Run scrapers, query results |
| **Technical Details** | `../docs/ADVANCED_SCRAPER_GUIDE.md` | Architecture, configuration |
| **Testing & Validation** | `../docs/SCRAPER_IMPLEMENTATION_CHECKLIST.md` | Verification checklist |
| **Improvements Overview** | `../docs/IMPROVEMENT_SUMMARY.md` | Before/after comparison |

---

## 🔄 Architecture Overview

### News Scraper Advanced
```
14 Manual Sources (Tier 1-4)
        ↓
    NewsAPI (10 queries)
        ↓
  Content Extraction (Cheerio + Axios)
        ↓
  College Matching (Fuse.js)
        ↓
  Classification (8 categories)
        ↓
  Quality Filtering (4 levels)
        ↓
  Database Storage (MongoDB)
```

### Reddit Scraper Advanced
```
13 Subreddits (sorted by priority)
        ↓
Post Extraction (100 posts/subreddit)
        ↓
College Matching
        ↓
Controversy Detection
        ↓
Quality Scoring (0-10)
        ↓
Engagement Analysis
        ↓
Database Storage
```

---

## 💡 Key Features

### 1. Controversy Detection ⚠️
Automatically identifies and tags:
- Scandals, fraud, misconduct
- Ragging/harassment issues
- Institutional problems
- Student safety concerns

**Levels:** `none`, `medium`, `high`, `critical`

### 2. Smart Classification
8-category system:
- Placement (salaries, packages)
- Admission (cutoffs, exams)
- Academic (faculty, courses)
- Controversy (issues, problems)
- Ranking (comparisons)
- Experience (reviews, stories)
- GD/Debate (discussions)
- Ragging (safety concerns)

### 3. Quality Pipeline
Multi-level filtering:
1. Content validation (length, spam)
2. Relevance filtering (college mentions)
3. Engagement scoring (upvotes, comments)
4. Duplicate detection (URL + fuzzy title)

### 4. Rich Metadata
Each article includes:
- Source platform (Reddit, NewsAPI, web)
- Content type & secondary categories
- Sentiment (positive, negative, neutral)
- Quality score (0-10)
- Engagement metrics
- Controversy indicators

---

## 📊 Expected Results

**Per Run:**
- News scraper: 50-100 articles (30-60 sec)
- Reddit scraper: 100-200 posts (20-40 sec)
- **Combined: 150-300 articles** (1-2 min)

**Per Day:**
- ~600-1,200 articles
- Coverage of 40+ colleges minimum
- Mix of controversies (15-20%)
- Placement news (25-30%)

**Content Distribution:**
- 35% Placement/Career
- 25% Admission/Entrance
- 15% Controversy/Issues
- 10% Academic
- 10% Rankings/Comparisons
- 5% Experiences/Stories

---

## 🎯 Common Commands

```bash
# Individual scrapers
npm run scrape:news-advanced      # News only
npm run scrape:reddit-advanced    # Reddit only

# Combined
npm run scrape:all-advanced       # Both in sequence
npm run scrape:all                # All scrapers (old + new + dedup)

# Check database
npm run health                    # Scraper status
```

---

## 🔍 Checking Results

### Count Articles
```javascript
db.news_articles.countDocuments()
// Returns: number of articles in database
```

### View Sample Article
```javascript
db.news_articles.findOne()
// Shows complete article with all fields
```

### Filter by Content Type
```javascript
db.news_articles.find({ "category.primary": "controversy" }).limit(5)
// Show controversial articles
```

### View by College
```javascript
db.news_articles.find({ college_names: "IIM Ahmedabad" }).limit(10)
// Show articles about specific college
```

---

## ⚙️ Configuration

### Adjust News Sources
Edit `scrape-news-advanced.js`:
```javascript
SOURCES.manual_sources.push({
  name: 'NewSite',
  url: 'https://...',
  selector: 'article',
  enabled: true
});
```

### Change Reddit Subreddits
Edit `scrape-reddit-advanced.js`:
```javascript
REDDIT_CONFIG.subreddits.push({
  name: 'NewSubreddit',
  priority: 8
});
```

### Adjust Quality Thresholds
Lower thresholds = more articles (but lower quality)  
Higher thresholds = fewer articles (but higher quality)

```javascript
// In scrape-news-advanced.js
const minimumContentLength = 100;  // Increase for stricter

// In scrape-reddit-advanced.js
minEngagement: {
  comments: 3,    // Increase for more popular posts only
  score: 5        // Increase for more upvotes
}
```

---

## 🐛 Troubleshooting

### No articles generated?
1. Check `db.news_articles.countDocuments()` - is it 0?
2. Verify colleges in database: `db.colleges.countDocuments()`
3. Check console output for errors
4. Increase log verbosity

### NewsAPI not working?
```bash
# Set NEWS_API_KEY in .env:
NEWS_API_KEY=abc123def456
# OR remove key to skip NewsAPI and use web sources only
```

### Network timeouts?
- Increase timeout in script (currently 10-15 seconds)
- Check internet connection
- Try running again (may be temporary)

### Database connection fails?
```bash
# Verify MongoDB is running:
npm run health
# Or check MONGODB_URI in .env
```

---

## 📈 Monitoring

### Health Check
```bash
npm run health
# Shows last scraper run status
```

### View Statistics
```javascript
// In MongoDB:
db.news_articles.aggregate([
  { $group: { 
      _id: "$category.primary", 
      count: { $sum: 1 }
  }}
]).toArray()
```

### Track Growth
```javascript
// Articles per day:
db.news_articles.aggregate([
  { $match: { published_at: { $gte: new Date('2026-02-01') }}},
  { $group: { _id: null, count: { $sum: 1 }}}
]).toArray()
```

---

## 🚦 Best Practices

### ✅ DO
- Run scrapers during off-peak hours
- Monitor execution logs
- Verify college mentions are accurate
- Schedule regular deduplication
- Keep API keys in .env (secret)

### ❌ DON'T
- Run multiple instances simultaneously (may hit rate limits)
- Expose API keys in code/git
- Modify college aliases without testing
- Skip quality filtering to maximize count
- Ignore error logs

---

## 📞 Support

### Quick Help
1. Check the **SCRAPER_QUICK_REFERENCE.md** file
2. Review the **ADVANCED_SCRAPER_GUIDE.md** for details
3. See **IMPROVEMENT_SUMMARY.md** for what's new

### Common Issues
- Missing API key → Add to .env
- No colleges found → Check college database
- Slow performance → Reduce sources or posts
- Memory issues → Run one scraper at a time

---

## 🎓 Learning Resources

- `SCRAPER_QUICK_REFERENCE.md` - Commands & examples
- `../docs/ADVANCED_SCRAPER_GUIDE.md` - Full technical guide
- `../docs/SCRAPER_IMPLEMENTATION_CHECKLIST.md` - Testing framework
- `../docs/IMPROVEMENT_SUMMARY.md` - What's new & why
- `../architecture/SCRAPER_ARCHITECTURE.md` - Original architecture (reference)

---

## 📋 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Feb 2026 | Advanced scrapers with controversy detection |
| 1.0 | Earlier | Original scrapers (still available) |

---

## 🎉 Getting Started

1. **First time?** → Read `SCRAPER_QUICK_REFERENCE.md`
2. **Want details?** → See `../docs/ADVANCED_SCRAPER_GUIDE.md`
3. **Need validation?** → Check `../docs/SCRAPER_IMPLEMENTATION_CHECKLIST.md`
4. **Want before/after?** → View `../docs/IMPROVEMENT_SUMMARY.md`

---

**Happy scraping! 🚀**

*For questions or improvements, see the documentation files listed above.*
