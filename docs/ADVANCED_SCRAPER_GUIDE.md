# Advanced Web Scraper Implementation Guide

**Status:** Implementation Complete  
**Last Updated:** February 2026  
**Version:** 2.0

---

## 📋 Overview

This document outlines the improvements to the web scraper system for fetching news about all 60+ Indian MBA colleges while maintaining quality and focusing on engaging content (controversies, placement news, experiences).

### Key Improvements

✅ **Expanded Source Coverage**: From 3 to 15+ news sources  
✅ **Controversy Detection**: Automated identification of controversial/engaging content  
✅ **Better Classification**: 8+ content categories with weighted scoring  
✅ **Quality Filtering**: Multi-level quality gates to ensure relevance  
✅ **Engagement Metrics**: Tracks engagement to identify popular topics  
✅ **Advanced Reddit Scraping**: Multi-subreddit with 13 relevant communities  

---

## 🏗️ Architecture Improvements

### 1. Multi-Source Strategy

**Before:**
- NewsAPI only (generic MBA queries)
- 2 manual sources
- Limited geographic coverage

**After:**
```
NewsAPI Sources:
├─ 10 specialized search terms (controversies, placements, etc.)
└─ 50 articles per term

Manual Web Scraping:
├─ Tier 1: Premium (The Hindu, Economic Times, LiveMint, Indian Express, TOI) - 5 sources
├─ Tier 2: MBA Specific (Poets & Quants, MBA.com) - 2 sources
├─ Tier 3: Indian MBA Platforms (CAT Portal, MBA Crystal Ball, etc.) - 4 sources
└─ Tier 4: Specialized Forums (InsideIIM, ClearAdmit, GMAC) - 3 sources
    Total: 14 manual sources
```

**Coverage:**
- National newspapers (5)
- MBA-specific publications (6)
- Specialized forums & blogs (3)
- Global MBA news (NewsAPI)

### 2. Controversy Classification System

New sentiment-detection engine identifies engaging content:

```javascript
CONTROVERSY_INDICATORS = {
  high_priority: [
    'scandal', 'issue', 'problem', 'malpractice', 
    'allegation', 'harassment', 'fraud', 'ethics'
  ],
  medium_priority: [
    'concern', 'doubt', 'unfair', 'suspicious'
  ]
}
```

**Controversy Levels:**
- `critical`: 2+ high-priority keywords detected
- `high`: 1 high-priority OR 2+ medium-priority
- `medium`: 1+ keyword matches
- `none`: No controversy markers

---

## 📊 Content Classification System

### 8-Category Classification Model

```
1. CONTROVERSY (Weight: 1.5x) ⚠️
   Keywords: scandal, issue, malpractice, harassment, ragging
   Purpose: Attract readers interested in institutional problems

2. PLACEMENT (Weight: 1.3x) 💼
   Keywords: salary, package, offer, recruiter, ctc
   Purpose: Career outcomes (most relevant for MBA seekers)

3. ADMISSION (Weight: 1.2x) 🎓
   Keywords: cutoff, score, application, qualify
   Purpose: Entrance information

4. RAGGING (Weight: 1.4x) ⚠️
   Keywords: harassment, bullying, assault
   Purpose: Student safety concerns

5. ACADEMIC (Weight: 0.8x) 📚
   Keywords: curriculum, faculty, course, teaching
   Purpose: Educational quality

6. RANKING (Weight: 1.1x) 📈
   Keywords: ranked, best, top, compared
   Purpose: Institutional credibility

7. EXPERIENCE (Weight: 1.0x) 💬
   Keywords: review, journey, insight, story
   Purpose: Real student feedback

8. GD_DEBATE (Weight: 1.0x) 🎤
   Keywords: debate, opinion, perspective, gdpi
   Purpose: Engagement & discussion value
```

### Weighted Scoring Example

```
Article: "IIM Bangalore faces ragging charges after student complaint"

Keyword matches:
- "ragging" (high_priority) → controversy: 1.5x
- "charges" → ragging: 1.4x
- "student" → context

Result: PRIMARY = "controversy" (highest score)
        SECONDARY = ["ragging"]
        ENGAGEMENT POTENTIAL = HIGH
```

---

## 🔄 Scraper Files

### 1. Advanced News Scraper
**File:** `scripts/scrape-news-advanced.js`  
**Run:** `npm run scrape:news-advanced`

**Features:**
- 14 manual web sources
- NewsAPI integration with 10 specialized queries
- Automatic quality filtering
- Sentiment analysis
- Image URL extraction

**Output Fields:**
```javascript
{
  title: String,
  content: String (5KB max),
  summary: String (300 chars max),
  source: {
    name: String,
    url: String,
    author: String,
    platform: "news_api" | "web_scrape"
  },
  college_names: [String],
  content_type: String (primary classification),
  category: {
    primary: String,
    secondary: [String]
  },
  sentiment: String ("positive" | "negative" | "neutral"),
  engagement_metrics: { score: Number, comments: Number },
  quality_indicators: { quality_score: Number (0-10) },
  published_at: Date,
  image_url: String (optional)
}
```

### 2. Advanced Reddit Scraper
**File:** `scripts/scrape-reddit-advanced.js`  
**Run:** `npm run scrape:reddit-advanced`

**Features:**
- 13 relevant subreddits with priority weighting
- Controversy detection
- Engagement value calculation
- Quality scoring
- Content type classification
- 100 posts per subreddit

**Targeted Subreddits:**
```
Priority 10 (Highest):
- r/MBA
- r/mba
- r/CATpreparation
- r/IIM

Priority 9:
- r/CAT
- r/CATlounge

Priority 8:
- r/GREprepare
- r/GMAT

Priority 6:
- r/IndianStudents

Priority 5-4:
- r/India, r/AskIndia, r/indianews, r/education
```

**Output Fields:**
```javascript
{
  // ... same as news scraper
  engagement_metrics: {
    reddit_score: Number,
    reddit_comments: Number,
    subreddit: String,
    subreddit_priority: Number
  },
  quality_indicators: {
    quality_score: Number (0-10),
    engagement_value: Number,
    controversy_level: String,
    controversy_score: Number
  }
}
```

---

## 🎯 Quality Assurance Framework

### Multi-Level Filtering

**Level 1: Content Validation**
```javascript
- Minimum content length: 100 characters
- Minimum word count: 30 words
- Avoid spam patterns: "buy now", "discount", "limited time"
```

**Level 2: Relevance Filtering**
```javascript
- MUST mention at least one college (mandatory)
- Check against college aliases database
- Fuzzy matching for variations
```

**Level 3: Engagement Filtering**
```javascript
Reddit posts:
- Minimum score: 5 upvotes
- Minimum comments: 3
- Not archived

Quality Score = (upvotes × 0.5) + (comments × 1.0)
Boost: +1.5x if contains valuable keywords
```

**Level 4: Duplication Check**
```javascript
- Check source.url uniqueness
- Fuzzy title matching (85% similarity)
- Mark duplicates with lower timestamp as secondary
```

---

## 💡 Controversy vs Quality Trade-off

### Strategy: "Quality Controversy"

We focus on **legitimate controversies** while filtering **spam/gossip**:

✅ **INCLUDE:**
- Institutional issues with documented evidence
- Placement statistics problems
- Curriculum concerns raised by multiple sources
- Regulatory/governance issues
- Student safety concerns (ragging, harassment)

❌ **EXCLUDE:**
- Unverified rumors
- Clickbait headlines without substance
- Spam comments masquerading as news
- Review manipulation
- Promotional content

**Example:**
```
GOOD: "IIM Delhi faces faculty shortage, impacts placement season"
BAD: "SHOCKING: IIM student's secret revealed!"

GOOD: "Placement stats vary significantly across IIMs"
BAD: "This IIM is literally the worst lol"
```

---

## 🚀 Usage Instructions

### 1. Setup

**Install additional packages (if needed):**
```bash
npm install cheerio axios node-cron
```

**Configure environment variables:**
```env
NEWS_API_KEY=your_newsapi_key_here
```

### 2. Run Individual Scrapers

**News Scraper Only:**
```bash
npm run scrape:news-advanced
# or directly:
node scripts/scrape-news-advanced.js
```

**Reddit Scraper Only:**
```bash
npm run scrape:reddit-advanced
# or directly:
node scripts/scrape-reddit-advanced.js
```

### 3. Run All Scrapers

Create a master script or update package.json:

```json
{
  "scripts": {
    "scrape:all-advanced": "node scripts/scrape-news-advanced.js && node scripts/scrape-reddit-advanced.js",
    "scrape:all-parallel": "concurrently 'node scripts/scrape-news-advanced.js' 'node scripts/scrape-reddit-advanced.js'"
  }
}
```

### 4. Schedule with Cron

**Update `scripts/scheduler.js`:**
```javascript
cron.schedule('0 */6 * * *', () => {
  console.log('📅 Scheduled: Reddit Scraper (Advanced)');
  require('./scrape-reddit-advanced.js');
});

cron.schedule('0 */12 * * *', () => {
  console.log('📅 Scheduled: News Scraper (Advanced)');
  require('./scrape-news-advanced.js');
});
```

---

## 📈 Performance Metrics

### Expected Results (per run)

**News Scraper Advanced:**
- Articles found: 500-1000
- After quality filtering: 150-300
- After college matching: 50-100 ingested
- Execution time: 30-60 seconds

**Reddit Scraper Advanced:**
- Posts found: 1300 (13 subreddits × 100 posts)
- After quality filtering: 400-600
- After college matching: 100-200 ingested
- Execution time: 20-40 seconds

**Combined Run:**
- Total ingested per full run: 150-300 articles
- Execution time: 1-2 minutes
- Database growth: ~100-200 articles/day

### Quality Metrics to Track

```javascript
// Add to dashboard
metrics = {
  total_articles_ingested: Number,
  avg_quality_score: Number (0-10),
  controversy_percentage: Number,
  placement_percentage: Number,
  college_coverage: { [collegeName]: count },
  source_distribution: { [sourceName]: count },
  sentiment_distribution: { positive: %, negative: %, neutral: % }
}
```

---

## 🔧 Customization Guide

### Add New News Source

**Edit `scripts/scrape-news-advanced.js`:**

```javascript
SOURCES.manual_sources.push({
  name: 'Edufanz',
  url: 'https://edufanz.com/mba-news',
  selector: 'article, div.post-item',
  enabled: true
});
```

### Adjust Quality Thresholds

**Edit quality filters:**
```javascript
// Increase strictness
const minimumContentLength = 200; // was 100

// Adjust engagement thresholds
minEngagement: {
  comments: 5,   // was 3
  score: 10      // was 5
}
```

### Add New Content Classifier

**Edit `CONTENT_CLASSIFIERS`:**
```javascript
CONTENT_CLASSIFIERS.scholarship = {
  keywords: ['scholarship', 'financial aid', 'loan', 'fee', 'waiver'],
  weight: 1.2
};
```

### Change Controversy Keywords

**Edit `CONTROVERSY_INDICATORS`:**
```javascript
CONTROVERSY_INDICATORS.high_priority.push('new_keyword');
CONTROVERSY_INDICATORS.medium_priority.splice(
  CONTROVERSY_INDICATORS.medium_priority.indexOf('old_keyword'), 1
);
```

---

## 📊 Database Schema Updates

### New Articles Collection Fields

```javascript
db.news_articles.insertOne({
  // Existing fields
  title: String,
  content: String,
  summary: String,
  source: { name, url, author, platform },
  college_names: [String],
  published_at: Date,
  
  // New fields
  content_type: String, // primary classification
  category: {
    primary: String,
    secondary: [String]  // up to 2 secondary tags
  },
  sentiment: String, // positive, negative, neutral
  
  // Engagement data
  engagement_metrics: {
    reddit_score: Number, // for Reddit posts
    reddit_comments: Number,
    subreddit: String,
    subreddit_priority: Number
  },
  
  // Quality indicators
  quality_indicators: {
    quality_score: Number, // 0-10
    engagement_value: Number,
    controversy_level: String, // none, medium, high, critical
    controversy_score: Number
  },
  
  // Metadata
  image_url: String, // for news articles
  created_at: Date
})
```

### Create Indices for Performance

```bash
# In MongoDB shell
db.news_articles.createIndex({ "college_names": 1 })
db.news_articles.createIndex({ "content_type": 1 })
db.news_articles.createIndex({ "quality_indicators.controversy_level": 1 })
db.news_articles.createIndex({ "published_at": -1 })
db.news_articles.createIndex({ "source.platform": 1 })
```

---

## 🎓 College Coverage

All 60+ colleges across 3 tiers are supported:

**Tier 1 (22 colleges):**
- IIM A, B, C, L, K, I (Indore), Shillong
- XLRI, FMS, SPJIMR, ISB, JBIMS, IIFT, TISS
- IIM Mumbai, MDI, IIT Bombay MBA, IIT Delhi MBA

**Tier 2 (18 colleges):**
- Newer IIMs (Udaipur, Trichy, Ranchi, Raipur, Rohtak, Kashipur)
- NMIMS, SIBM, SCMHRD, XIMB, IMT, IMI, MICA, IRMA
- IIT KGP, IIT Madras, IIT Kanpur, IIT Roorkee MBA

**Tier 3 (21 colleges):**
- Baby IIMs (Amritsar, Nagpur, Vizag, Bodh Gaya, Jammu, Sambalpur, Sirmaur)
- Regional privates (GIM, TAPMI, GLIM, FORE, KJ Somaiya, Welingkar, SIIB, SIBM B, etc.)
- Volume players and emerging institutions

**Alias Coverage:** 200+ variations for robust matching.

---

## ⚠️ Important Notes

1. **Rate Limiting:**
   - NewsAPI: 500 requests/day (check tier)
   - Reddit: No official limit, but use respectful headers
   - Manual sources: Respect robots.txt and terms of service

2. **Data Freshness:**
   - News articles: 2-4 hours old on average
   - Reddit posts: Real-time (latest 100 per subreddit)
   - Deduplication: Daily recommended

3. **Quality vs Speed Trade-off:**
   - Current setting: Quality preferred (fewer articles, well-curated)
   - To increase volume: Lower quality threshold (see Customization)
   - To increase speed: Reduce posts per subreddit (from 100 to 50)

4. **Error Handling:**
   - Failed sources don't stop other sources
   - Errors logged to console with full details
   - Retry logic for network timeouts

---

## 📚 References

- **NewsAPI:** https://newsapi.org (free tier: 500/day)
- **Reddit API:** https://www.reddit.com/dev/api
- **Cheerio (Web Scraping):** https://cheerio.js.org
- **Fuse.js (Fuzzy Matching):** https://fusejs.io

---

## 🎯 Next Steps / Roadmap

**Phase 1 (Current):** ✅ Multi-source expansion with controversy detection  
**Phase 2:** LinkedIn job posts & updates integration  
**Phase 3:** Sentiment analysis with NLP (using AWS Comprehend or similar)  
**Phase 4:** Real-time alerts for critical controversies  
**Phase 5:** Predictive ranking based on engagement  
**Phase 6:** Personalized college news feed for matched users  

---

**Owner:** Development Team  
**Status:** Ready for Production  
**Last Review:** February 2026
