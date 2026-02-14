# MBA Portal Architecture Redesign
## From Profile-Centric to Content-Driven Model

**Date:** February 2026  
**Status:** Strategic Planning Document  

---

## EXECUTIVE SUMMARY

**Current Model:** User Profile Dependent
- Forces users to enter sensitive marks (10th/12th/Grad)
- Content locked behind authentication
- Focus on GD/PI preparation (static)

**New Model:** Content-Driven Discovery
- Zero friction entry: **No signup required to browse**
- Profile is completely optional secondary feature
- Core value: **Real-time MBA News, Controversies, Placement Stats**
- SEO-optimized with 200+ colleges indexed
- Auto-scraped content from Reddit, news sites, institutional data

---

## 1. USER FLOW REDESIGN

### Current Flow (To Be Removed)
```
Land on site → Request OTP → Verify Email → Enter Marks (10/12/Grad) → View Profile
```

### New Flow (Friction-Free)
```
Land on site
├─ Path A (Anonymous, Metrics-Driven)
│  ├─ Browse College Directory
│  ├─ View College-Specific News Feed
│  ├─ Read Placement Stats, Controversies
│  ├─ Sort by Tier, Location, Package
│  └─ Zero signup required
│
└─ Path B (Authenticated, Optional Profile)
   ├─ Sign in with OTP (optional, for saved preferences)
   ├─ Optionally complete profile (9/9/9)
   ├─ Personalized college recommendations
   └─ Bookmarked news articles
```

**Key Change:** Authentication becomes a convenience feature, not a prerequisite.

---

## 2. DATABASE SCHEMA REDESIGN

### Collections Overview

#### 2.1 **colleges** Collection
Pre-seeded, comprehensive index of 200+ institutions

```javascript
{
  _id: ObjectId,
  name: String,                    // "IIM Bangalore"
  alias: [String],                  // ["IIM B", "IIMB"]
  tier: String,                     // "Tier-1: IIM Blacki" | "Tier-2: New IIMs" | "Tier-3: Private"
  establishment_type: String,       // "Government" | "Private" | "Deemed"
  location: {
    city: String,                   // "Bangalore"
    state: String,                  // "Karnataka"
    country: String
  },
  avg_package: {
    total: Number,                  // 29.8
    currency: String,               // "INR (Lakhs)"
    median: Number,
    international: Number
  },
  recruitment_stats: {
    placement_rate: Number,         // 98
    avg_base_salary: Number,
    top_recruiter_packages: Number, // Max package
    major_recruiters: [String]      // ["McKinsey", "BCG", etc]
  },
  academics: {
    entrance_exam: String,          // "CAT" | "XAT" | "GMAT"
    avg_entrance_score: Number,
    program_duration_months: Number,
    batch_size: Number,
    cutoff_percentile: Number
  },
  social_metrics: {
    reddit_mentions_count: Number,
    controversy_count: Number,      // Ragging, placement issues
    recent_news_count: Number
  },
  created_at: Date,
  updated_at: Date,
  is_active: Boolean,
  seo_tags: [String]                // For indexing: "IIM", "MBA", "Bangalore"
}
```

#### 2.2 **news_articles** Collection
Scraped & curated content, tagged to colleges

```javascript
{
  _id: ObjectId,
  title: String,
  content: String,                   // Full article text
  summary: String,                   // 200 char preview
  content_type: String,              // "placement_stats" | "controversy" | "general_news" | "reddit_discussion"
  college_ids: [ObjectId],           // References to colleges collection
  college_names: [String],           // Denormalized for quick filtering
  source: {
    name: String,                    // "Reddit r/CATpreparation" | "Hindu" | "Economic Times"
    url: String,
    author: String,
    platform: String                 // "reddit" | "news_site" | "institutional"
  },
  sentiment: String,                 // "positive" | "negative" | "neutral"
  keywords: [String],                // ["IIM B", "ragging", "placement"]
  engagement_metrics: {
    reddit_score: Number,
    reddit_comments: Number,
    upvotes: Number,
    shares: Number
  },
  category: {
    primary: String,
    secondary: [String]
  },
  published_at: Date,
  scraped_at: Date,
  created_at: Date,
  is_verified: Boolean,              // Manual review flag
  is_feature: Boolean                // Highlight for homepage
}
```

#### 2.3 **users** Collection (Simplified)
Optional authentication, lightweight tracking

```javascript
{
  _id: ObjectId,
  email: String,
  is_verified: Boolean,
  // OPTIONAL - Only if user chooses to create profile
  profile: {
    acad_10th: Number,               // null if not provided
    acad_12th: Number,
    acad_grad: Number,
    acad_stream: String,
    current_company: String,
    work_ex_months: Number,
    completed: Boolean
  },
  preferences: {
    bookmarked_articles: [ObjectId],
    favorite_colleges: [ObjectId],
    interested_tiers: [String]       // ["Tier-1: IIM Blacki", "Tier-1: IIT MBAs"]
  },
  anonymous_session_id: String,      // For tracking anon users
  created_at: Date,
  last_login: Date,
  updated_at: Date
}
```

#### 2.4 **scraper_logs** Collection
Track scraping operations & freshness

```javascript
{
  _id: ObjectId,
  scraper_name: String,              // "reddit_scraper" | "news_aggregator"
  source: String,                     // "reddit" | "thehindu.com"
  status: String,                     // "success" | "failed" | "partial"
  articles_found: Number,
  articles_ingested: Number,
  run_timestamp: Date,
  next_run_scheduled: Date,
  error_log: String,
  execution_time_ms: Number
}
```

#### 2.5 **college_tiers** Collection (Reference)
Static tier definitions for quick filtering

```javascript
{
  _id: ObjectId,
  tier_name: String,
  tier_code: String,                 // "TIER_1_IIM_BLACKI"
  rank: Number,
  colleges: [ObjectId],              // References to colleges
  description: String,
  expected_cat_percentile: Number
}
```

---

## 3. COLLEGE DATABASE SEED DATA

### Tier-1: IIM Blacki (Established, Strategic Tier)
- IIM Ahmedabad
- IIM Bangalore
- IIM Calcutta
- IIM Lucknow
- IIM Kozhikode

### Tier-1: IIM New Generation (Post-2010 Growth)
- IIM Indore ⭐ (Recently promoted to Tier-1)
- IIM Shillong
- IIM Rohtak
- IIM Ranchi
- IIM Raipur
- IIM Trichy
- IIM Udaipur
- IIM Kashipur

### Tier-1 Baby IIMs (Mass-Tier, High Traffic)
- IIM Nagpur
- IIM Amritsar
- IIM Bodh Gaya
- IIM Jammu
- IIM Sambalpur
- IIM Sirmaur
- IIM Visakhapatnam

### Tier-1: IIT MBAs (Premier Tech MBAs)
- IIT Bombay
- IIT Delhi
- IIT Kharagpur
- IIT Roorkee
- IIT Kanpur
- IIT Madras
- IIT Jodhpur

### Tier-2: Strategic Non-IMS
- XLRI Jamshedpur ⭐
- XLRI Delhi
- ISB Hyderabad ⭐
- ISB Mohali
- MDI Gurgaon ⭐
- SPJIMR Mumbai
- FMS Delhi
- IIFT Delhi
- IIFT Kolkata
- TISS Mumbai
- JBIMS Mumbai

### Tier-3: Traffic Drivers (Volume)
- NMIMS Mumbai (40+ articles/month expected)
- SIBM Pune (30+ articles/month)
- SCMHRD Pune
- IMT Ghaziabad
- XIMB Bhubaneswar
- IMI New Delhi
- FORE Business School
- GIM Goa
- TAPMI Bangalore
- GL Group (Chennai, Gurgaon)

**Total: ~60 colleges across 3 tiers + 20-30 additional tier-3 institutions**

---

## 4. CONTENT AGGREGATION ARCHITECTURE

### 4.1 Scraper Types

#### A. Reddit Scraper (Primary)
**Target:** r/CATpreparation, r/MBA, r/IIM

```
Reddit Post
├─ Extract discussion
├─ Identify college mentions (NLP + keyword matching)
├─ Classify: Placement | Ragging | Controversy | General
├─ Tag to colleges collection
└─ Store with sentiment
```

**Frequency:** Every 6 hours  
**Volume:** 50-200 new posts/week  
**Data Points:** Score, comments, author, timestamp

#### B. News Aggregator (Secondary)
**Target:** The Hindu, Economic Times, LiveMint, Times of India, Business Today

```
News Article
├─ RSS feed / Web scrape
├─ Headline + Summary extraction
├─ College entity extraction (NLP)
├─ Classification
├─ Tag to colleges
└─ Store with source attribution
```

**Frequency:** Every 12 hours  
**Volume:** 10-30 articles/week  

#### C. Institutional Scraper (Tertiary)
**Target:** Official college websites for placement stats

```
College Official Data
├─ Extract placement stats from PDF/website
├─ Update avg_package fields
├─ Scrape recruiter lists
├─ Store as authoritative source
```

**Frequency:** Quarterly (post-placement season)  

### 4.2 Content Classification Pipeline

```
Raw Content
    ↓
[NLP Entity Recognition]
    ↓
Match college names/aliases
    ↓
[Multi-label Classification]
    ├─ Placement Stats
    ├─ Controversy/Ragging
    ├─ General News
    ├─ Admissions
    ├─ Academics
    └─ General Discussion
    ↓
[Sentiment Analysis]
    ├─ Positive
    ├─ Negative
    └─ Neutral
    ↓
[Deduplication Check]
    ↓
Store in news_articles collection
```

### 4.3 Freshness & Quality Control

- **Deduplication:** Avoid posting duplicate articles (fuzzy string matching)
- **Verification Flag:** Manual spot-check for top stories
- **Spam Filter:** Regex-based filtering for obvious spam
- **Engagement Metric:** Sort by Reddit upvotes/comments (social proof)
- **Stale Content Removal:** Archive articles older than 3 months

---

## 5. API ROUTES & ENDPOINTS

### 5.1 Public Routes (NO AUTH REQUIRED) - New Discovery Features

#### Get College Directory
```
GET /api/colleges
Query Params:
  - tier=TIER_1_IIM_BLACKI,TIER_1_IIT
  - location=Bangalore,Delhi
  - min_package=20
  - search=IIM Bangalore
  - sort=package_desc|recent_news
  - limit=50
  - offset=0

Response:
{
  success: true,
  data: [{
    _id, name, location, avg_package, 
    tier, recent_news_count, social_score
  }],
  total: 200,
  pagination: {...}
}
```

#### Get College Details (No signup needed)
```
GET /api/colleges/:collegeId

Response:
{
  success: true,
  data: {
    _id, name, tier, location, avg_package,
    recruitment_stats,
    academics,
    recent_articles: [5 most recent],
    related_colleges: [similar tier colleges]
  }
}
```

#### Get News Feed (Filter by College or Explore All)
```
GET /api/news
Query Params:
  - college_ids=objId1,objId2       (Filter by colleges)
  - content_type=controversy,placement_stats
  - search=ragging               (Free text search)
  - sort=recent|trending|most_engagement
  - limit=20
  - offset=0

Response:
{
  success: true,
  data: [{
    _id, title, summary, content_type,
    colleges: [names], 
    source: {...},
    published_at,
    engagement: {...}
  }] ,
  total: 1250,
  pagination: {...}
}
```

#### Get College-Specific News Feed
```
GET /api/colleges/:collegeId/news
Query Params:
  - content_type=all|controversy|placement|general
  - sort=recent|trending
  - limit=20

Response:
{
  success: true,
  data: [{articles}],
  college_name: "IIM Bangalore",
  total_articles: 245
}
```

#### Get Trending Colleges (By News Mentions & Engagement)
```
GET /api/trending-colleges
Query Params:
  - timeframe=week|month|all_time
  - limit=10

Response:
{
  success: true,
  data: [{
    _id, name, recent_articles_count,
    social_score, trending_reason
  }]
}
```

### 5.2 Authentication Routes (Optional)

#### Request OTP (No Profile Mandatory)
```
POST /auth/request-otp
Body: { email }

Note: Users can still browse without this step.
```

#### Create Optional Profile (After Auth)
```
POST /auth/complete-profile
Body: {
  email,
  acad_10th: null,     // Optional - can skip
  acad_12th: null,
  acad_grad: null,
  interested_colleges: [collegeIds]
}

Note: Marks are completely optional. Endpoint accepts partial data.
```

### 5.3 Protected Routes (Auth Required)

#### Get Bookmarked Articles
```
GET /auth/me/bookmarks
Response: { success, data: [articles] }
```

#### Add to Bookmarks
```
POST /auth/me/bookmarks/:articleId
```

#### Get Personalized Recommendations
```
GET /auth/me/recommendations

Logic:
  - If profile complete: Recommend colleges matching 9/9/9 profile
  - If profile incomplete: Recommend based on browsing history
  - Return MAX relevant colleges only (avoid overwhelming)
```

#### Logout
```
GET /auth/logout
```

---

## 6. SCRAPER IMPLEMENTATION ARCHITECTURE

### 6.1 Tech Stack
- **Framework:** Node.js + Express
- **Scraping:** Puppeteer (Reddit needs JS rendering) + Cheerio (news sites)
- **Scheduling:** node-cron or Bull (message queue)
- **NLP:** compromise.js (lightweight) or AWS Comprehend (scalable)
- **Database:** MongoDB (already in use)

### 6.2 Scraper Modules Structure

```
scrapers/
├─ reddit-scraper.js
│  ├─ fetchRedditPosts()
│  ├─ extractCollegeMentions()
│  ├─ classifyContent()
│  └─ storeArticles()
│
├─ news-scraper.js
│  ├─ fetchNewsFeeds() [RSS + web scrape]
│  ├─ extractCollegeMentions()
│  ├─ storeArticles()
│
├─ institutional-scraper.js
│  ├─ fetchPlacementStats()
│  └─ updateCollegeMetrics()
│
├─ deduplication.js
│  ├─ fuzzyMatch()
│  └─ isDuplicate()
│
└─ scheduler.js
   ├─ redditJob (every 6h)
   ├─ newsJob (every 12h)
   └─ cleanupJob (daily)
```

### 6.3 Example: Reddit Scraper Pseudocode

```javascript
const redditScraper = async () => {
  // 1. Fetch recent posts from r/CATpreparation
  const posts = await fetchSubredditPosts([
    'r/CATpreparation',
    'r/MBA',
    'r/IIM'
  ], limit: 100);

  for (const post of posts) {
    // 2. Check if duplicate
    if (await isDuplicate(post.url)) continue;

    // 3. Extract college mentions
    const colleges = extractCollegeMentions(
      post.title + post.selftext,
      COLLEGE_ALIASES_MAP  // {"IIM B": ObjectId_of_IIM_Bangalore}
    );

    if (colleges.length === 0) continue;

    // 4. Classify content
    const contentType = classifyContent(
      post.title,
      post.selftext,
      KEYWORDS_BY_TYPE // {"ragging": [...], "placement": [...]}
    );

    // 5. Analyze sentiment
    const sentiment = analyzeSentiment(post.selftext);

    // 6. Store article
    await newsArticles.insertOne({
      title: post.title,
      content: post.selftext,
      summary: post.selftext.slice(0, 200),
      content_type: contentType,
      college_ids: colleges,
      college_names: colleges.map(id => collegeMap[id]),
      source: {
        name: 'Reddit r/CATpreparation',
        url: post.url,
        author: post.author,
        platform: 'reddit'
      },
      sentiment,
      engagement_metrics: {
        reddit_score: post.score,
        reddit_comments: post.num_comments
      },
      published_at: new Date(post.created_utc * 1000),
      scraped_at: new Date()
    });
  }

  // Log operation
  await scraperLogs.insertOne({
    scraper_name: 'reddit_scraper',
    status: 'success',
    articles_found: posts.length,
    run_timestamp: new Date()
  });
};
```

---

## 7. FRONTEND REDESIGN (Views)

### 7.1 Homepage (NEW)
Instead of profile form:
- **Hero:** "Discover MBAs. Real Stories. Real Stats."
- **Search Bar:** "Search colleges..."
- **Tier Cards:** IIM Blacki | IIM New Gen | IIT MBAs | Top Private
- **Trending Section:** "Hot Takes This Week"
  - Top 5 colleges by news mentions
  - Most controversial stories
  - Latest placement data
- **Feature Stories:** Manually featured news items
- **Browse All:** Grid of 200+ colleges, sortable

### 7.2 College Detail Page (NEW)
```
/college/:collegeId

Layout:
- Header: College name, tier, location, avg package
- Stats Card: Placement rate, avg salary, major recruiters
- Tabs:
  ├─ Overview (academics, cutoff, batch size)
  ├─ News Feed (all college-specific articles)
  ├─ Placement Stats (updated quarterly)
  ├─ Related Colleges (similar tier)
  └─ Discussions (Reddit mentions)
- [Optional] Sign Up / Bookmark buttons
```

### 7.3 News/Gossip Feed (NEW)
```
/news

Layout:
- Filter Sidebar: By tier, college, content type, date range
- Feed: Chronological list of articles
- Each article card shows: Title, Preview, Source, College Tags
- [Optional when signed in] Bookmark button
```

### 7.4 Authentication Views (UNCHANGED)
- Login: OTP in email (keep as-is)
- Profile Completion: Make completely optional
  - Show modal/page with "Skip" button
  - Only ask for interested colleges

---

## 8. SEO OPTIMIZATION STRATEGY

### 8.1 College Pages (200+ indexed)
```
Each college page targets:
- "IIM Bangalore MBA" SEO
- News feeds increase freshness signals
- College-specific content (100+ articles per college)
- Internal linking between tier-related colleges
```

### 8.2 News Feed Pages
```
- Trending page: "MBA Gossip This Week"
- Archive pages: "IIM Ragging Controversies"
- Controversy pages: "MBA Placement Failures"
```

### 8.3 Structured Data
```
Implement JSON-LD for:
- EducationalOrganization (colleges)
- NewsArticle (from scraped content)
- BreadcrumbList (college pages)
- AggregateOffer (for avg package)
```

---

## 9. MIGRATION STRATEGY

### Phase 1: Content Foundation (Weeks 1-2)
- [ ] Create college database (200+ institutions)
- [ ] Deploy Reddit scraper (test with 50 posts)
- [ ] Deploy news aggregator (test with 10 articles)
- [ ] Build college detail views

### Phase 2: Public Discovery (Weeks 3-4)
- [ ] Build homepage (tier cards + trending)
- [ ] Build college directory with filters
- [ ] Build news feed
- [ ] Deprecate GD/PI war room (archive old content)

### Phase 3: Make Auth Optional (Week 5)
- [ ] Modify auth flow (no profile required)
- [ ] Keep bookmarks for authenticated users only
- [ ] Add personalization (optional)

### Phase 4: Scale Scrapers (Week 6)
- [ ] Increase Reddit frequency
- [ ] Add 5-10 news sources
- [ ] Implement deduplication
- [ ] Add sentiment analysis

### Phase 5: Launch & Monitor (Week 7+)
- [ ] SEO tuning
- [ ] Monitor scraper quality
- [ ] User feedback loop
- [ ] Iterate on college database

---

## 10. TECHNOLOGY STACK ADDITIONS

```json
{
  "new-dependencies": {
    "puppeteer": "^latest",        // Reddit scraping
    "cheerio": "^latest",          // HTML parsing
    "node-cron": "^latest",        // Scheduling
    "compromise": "^latest",       // NLP (college extraction)
    "fuzzyset": "^latest",         // Fuzzy matching (dedup)
    "dotenv": "existing",          // ENV vars
    "mongodb": "existing"           // Already in use
  },
  "optional-scalable-deps": {
    "bull": "message queue",
    "redis": "cache layer",
    "aws-sdk": "Comprehend NLP"
  }
}
```

---

## 11. SUCCESS METRICS

### Month 1
- [ ] 200+ colleges indexed
- [ ] 500+ articles scraped
- [ ] 1,000 unique weekly users (no signup required)
- [ ] 10,000+ Google impressions on college pages

### Month 2
- [ ] 2,000+ articles
- [ ] 5,000 unique weekly users
- [ ] 50,000+ impressions
- [ ] 100K monthly pageviews

### Month 3
- [ ] 5,000+ articles
- [ ] Tier-2 & Tier-3 traffic comparable
- [ ] 200K monthly pageviews
- [ ] Emerging organic keywords

---

## CRITICAL DEPENDENCIES

1. **College Database Accuracy:** Every alias must be correct for scraper to tag properly
2. **NLP Entity Recognition:** Quality of college extraction directly impacts news feed accuracy
3. **Freshness:** Stale articles = low engagement; schedule scrapers appropriately
4. **Deduplication:** Prevent duplicate articles from degrading UX
5. **Reddit API Rate Limits:** Budget requests (60/min without auth)
6. **Sentiment Analysis:** Train on MBA-specific language (controversies, placements)

---

## RISK MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Reddit API blocks scraper | Content flow stops | Use Reddit API officially, implement backoff |
| Scraper accuracy (wrong college tags) | Bad UX (wrong articles) | Fuzzy matching + manual verification |
| Duplicate articles | Spam-like feel | Implement robust deduplication |
| NLP false positives | Noise in feed | Whitelist college names, threshold confidence |
| College database incomplete | Missing traffic | Start with top 60, expand iteratively |

---

## NEXT STEPS

1. **Immediate:** Create college database (SQL seed script)
2. **Parallel:** Build college detail views (frontend)
3. **Parallel:** Develop Reddit scraper prototype
4. **Validate:** Run scraper on 100 posts, manually verify quality
5. **Expand:** Add more colleges, refine classification
6. **Launch:** Make homepage public, deprecate profile requirement

---

**Owner:** Backend Architecture  
**Reviewers:** PY the Business Lead, Product Team  
**Last Updated:** February 2026
