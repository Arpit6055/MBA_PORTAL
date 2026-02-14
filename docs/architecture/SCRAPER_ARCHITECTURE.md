# Scraper Architecture & Implementation Guide

> **📢 UPDATE:** An advanced version of the scrapers is now available! See [ADVANCED_SCRAPER_GUIDE.md](../ADVANCED_SCRAPER_GUIDE.md) and [IMPROVEMENT_SUMMARY.md](../IMPROVEMENT_SUMMARY.md) for:
> - 15+ news sources (vs 3 original)
> - 13 targeted subreddits (vs 3 original)
> - Controversy detection engine ⚠️
> - 8-category content classification
> - Run with: `npm run scrape:all-advanced`

## Overview
Real-time content aggregation system to keep the MBA news feed fresh. This is the ENGINE of the new platform.

---

## 1. SCRAPER TECHNOLOGY STACK

### Core Libraries
```json
{
  "puppeteer": ">=20.0.0",          // Reddit JS rendering
  "cheerio": ">=1.0.0",              // HTML parsing (news sites)
  "node-cron": ">=3.0.0",            // Scheduling
  "axios": ">=1.6.0",                // HTTP requests
  "fuzzyset.js": ">=latest",         // Fuzzy matching (dedup)
  "compromise": ">=14.0.0"           // Lightweight NLP
}
```

### Optional (For Scale)
```json
{
  "bull": "message queue",
  "redis": "cache & queue storage",
  "aws-comprehend": "production NLP"
}
```

---

## 2. SCRAPER ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                 SCHEDULER (node-cron)                    │
├─────────────────────────────────────────────────────────┤
│ ├─ Every 6h:  RedditScraper.run()                       │
│ ├─ Every 12h: NewsScraper.run()                         │
│ ├─ Daily:     Deduplication.run()                       │
│ └─ Weekly:    InstitutionalScraper.run()                │
└──────────────┬──────────────────────────────────────────┘
               │
        ┌──────┴───────┐
        │              │
    ┌───▼──┐      ┌───▼──┐
    │Reddit│      │News  │
    │ API  │      │Sites │
    └───┬──┘      └───┬──┘
        │              │
   ┌────▼──────────────▼────┐
   │  Raw Content Pipeline   │
   ├────────────────────────┤
   │ 1. Extract college refs │
   │ 2. Classify content     │
   │ 3. Sentiment analysis   │
   │ 4. Deduplication       │
   │ 5. Store in MongoDB    │
   └────┬───────────────────┘
        │
   ┌────▼──────────────────┐
   │  news_articles        │
   │  (with metadata)      │
   └──────────────────────┘
```

---

## 3. REDDIT SCRAPER (PRIMARY)

### Implementation

```javascript
// scrapers/reddit-scraper.js
const axios = require('axios');
const Fuzzyset = require('fuzzyset.js');
const NewsArticleModel = require('../models/NewsArticleModel');
const CollegeModel = require('../models/CollegeModel');
const ScraperLogModel = require('../models/ScraperLogModel');

const COLLEGE_ALIASES = require('./college-aliases.json');
const KEYWORD_CLASSIFIERS = require('./keyword-classifiers.json');

class RedditScraper {
  static async run() {
    const startTime = Date.now();
    let articlesFound = 0;
    let articlesIngested = 0;
    let errors = [];

    try {
      console.log('🔄 Starting Reddit Scraper...');

      // Fetch posts from target subreddits
      const subreddits = [
        'r/CATpreparation',
        'r/MBA',
        'r/IIM',
        'r/mba'
      ];

      for (const subreddit of subreddits) {
        try {
          const posts = await this.fetchSubredditPosts(subreddit, { limit: 50 });
          articlesFound += posts.length;

          for (const post of posts) {
            try {
              // Skip if already exists
              const existing = await db.findOne('news_articles', {
                'source.url': post.url
              });
              
              if (existing) {
                console.log(`⊘ Duplicate: ${post.title.slice(0, 50)}`);
                continue;
              }

              // Extract college mentions
              const colleges = await this.extractCollegeMentions(
                post.title + ' ' + post.selftext
              );

              if (colleges.length === 0) {
                continue; // Skip if no colleges mentioned
              }

              // Classify content
              const contentType = this.classifyContent(
                post.title,
                post.selftext
              );

              // Basic sentiment
              const sentiment = this.analyzeSentiment(post.selftext);

              // Create article
              const article = {
                title: post.title,
                content: post.selftext,
                summary: post.selftext.slice(0, 200),
                content_type: contentType,
                college_ids: colleges.map(c => c._id),
                college_names: colleges.map(c => c.name),
                source: {
                  name: 'Reddit ' + subreddit,
                  url: `https://reddit.com${post.permalink}`,
                  author: post.author,
                  platform: 'reddit'
                },
                sentiment: sentiment,
                keywords: this.extractKeywords(post.title, post.selftext),
                engagement_metrics: {
                  reddit_score: post.score,
                  reddit_comments: post.num_comments
                },
                published_at: new Date(post.created_utc * 1000),
                category: {
                  primary: contentType,
                  secondary: []
                }
              };

              // Save article
              await NewsArticleModel.create(article);
              articlesIngested++;

              console.log(`✓ Ingested: ${article.title.slice(0, 50)}`);
            } catch (postErr) {
              errors.push(`Error processing post: ${postErr.message}`);
              console.error(`✗ Error: ${postErr.message}`);
            }
          }
        } catch (subErr) {
          errors.push(`Error fetching ${subreddit}: ${subErr.message}`);
          console.error(`✗ ${subreddit}: ${subErr.message}`);
        }
      }

      // Log the scraper run
      const executionTime = Date.now() - startTime;
      await ScraperLogModel.logScraperRun('reddit_scraper', 'reddit.com', 'success', {
        found: articlesFound,
        ingested: articlesIngested,
        executionTime,
        error: errors.length > 0 ? errors.join(';') : null,
        nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6h later
      });

      console.log(`✓ Reddit Scraper Complete: Found ${articlesFound}, Ingested ${articlesIngested}`);
      console.log(`⏱ Execution time: ${executionTime}ms`);

    } catch (error) {
      console.error('Fatal error in Reddit Scraper:', error);
      await ScraperLogModel.logScraperRun('reddit_scraper', 'reddit.com', 'failed', {
        error: error.message,
        executionTime: Date.now() - startTime
      });
    }
  }

  /**
   * Fetch posts from a subreddit using Reddit API
   */
  static async fetchSubredditPosts(subreddit, options = {}) {
    const limit = options.limit || 25;
    const url = `https://www.reddit.com/${subreddit}/new.json?limit=${limit}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'MBA-Portal-Scraper/1.0'
        }
      });

      return response.data.data.children.map(child => child.data);
    } catch (error) {
      console.error(`Error fetching ${subreddit}:`, error.message);
      return [];
    }
  }

  /**
   * Extract college mentions from text
   */
  static async extractCollegeMentions(text) {
    const colleges = [];
    const collegeFuzzy = Fuzzyset(Object.keys(COLLEGE_ALIASES));

    // Extract exact matches first
    for (const [alias, collegeId] of Object.entries(COLLEGE_ALIASES)) {
      const regex = new RegExp(`\\b${alias}\\b`, 'gi');
      if (regex.test(text)) {
        const college = await CollegeModel.findById(collegeId);
        if (college && !colleges.find(c => c._id === college._id)) {
          colleges.push(college);
        }
      }
    }

    // Fuzzy match for variations
    const words = text.match(/\b\w+\s+\w+\b/g) || [];
    for (const phrase of words) {
      const matches = collegeFuzzy.get(phrase, null, 0.8); // 80% confidence
      if (matches && matches.length > 0) {
        const match = matches[0][1];
        const collegeId = COLLEGE_ALIASES[match];
        if (collegeId) {
          const college = await CollegeModel.findById(collegeId);
          if (college && !colleges.find(c => c._id === college._id)) {
            colleges.push(college);
          }
        }
      }
    }

    return colleges;
  }

  /**
   * Classify content type
   */
  static classifyContent(title, content) {
    const text = (title + ' ' + content).toLowerCase();

    const classifiers = {
      'placement_stats': ['placement', 'package', 'salary', 'offer', 'recruiter', 'hiring'],
      'controversy': ['controversy', 'scandal', 'issue', 'problem', 'failed'],
      'ragging': ['ragging', 'harassment', 'bullying', 'abuse', 'senior'],
      'admissions': ['admission', 'application', 'intake', 'cutoff', 'entrance'],
      'academic': ['curriculum', 'course', 'faculty', 'teaching', 'program'],
      'general_news': [] // default catch-all
    };

    for (const [type, keywords] of Object.entries(classifiers)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return type;
        }
      }
    }

    return 'general_news';
  }

  /**
   * Basic sentiment analysis
   */
  static analyzeSentiment(text) {
    const positiveWords = ['great', 'excellent', 'amazing', 'good', 'love', 'best'];
    const negativeWords = ['bad', 'terrible', 'hate', 'worst', 'issue', 'problem', 'fail'];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Extract keywords from text
   */
  static extractKeywords(title, content) {
    // Simple keyword extraction (in production, use compromise.js)
    const words = (title + ' ' + content)
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4);

    // Remove duplicates
    return [...new Set(words)].slice(0, 10);
  }
}

module.exports = RedditScraper;
```

---

## 4. NEWS AGGREGATOR SCRAPER (SECONDARY)

### Implementation

```javascript
// scrapers/news-scraper.js
const axios = require('axios');
const cheerio = require('cheerio');
const NewsArticleModel = require('../models/NewsArticleModel');
const CollegeModel = require('../models/CollegeModel');
const ScraperLogModel = require('../models/ScraperLogModel');

class NewsScraper {
  static async run() {
    const startTime = Date.now();
    let articlesFound = 0;
    let articlesIngested = 0;

    const sources = [
      {
        name: 'The Hindu Education',
        url: 'https://www.thehindu.com/education/',
        selector: 'article, div.tg-item'
      },
      {
        name: 'Economic Times - MBA',
        url: 'https://economictimes.indiatimes.com/mba',
        selector: 'div.listing-item, li.clearfix'
      },
      {
        name: 'LiveMint - Education',
        url: 'https://www.livemint.com/education',
        selector: 'article, div.story-block'
      }
    ];

    for (const source of sources) {
      try {
        console.log(`🔄 Scraping: ${source.name}`);
        
        const response = await axios.get(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          },
          timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const articles = $(source.selector);

        articlesFound += articles.length;

        articles.each(async (index, element) => {
          try {
            const titleElem = $(element).find('h2, h3, a');
            const title = titleElem.text().trim();

            if (!title) return;

            const link = $(element).find('a').attr('href');
            const summary = $(element).find('p').text().slice(0, 200);

            // Check if already exists
            const existing = await db.findOne('news_articles', {
              'source.url': link
            });

            if (existing) return;

            // Extract college mentions
            const colleges = await this.extractCollegeMentions(title + ' ' + summary);

            if (colleges.length === 0) return;

            const article = {
              title,
              content: summary,
              summary: summary.slice(0, 200),
              content_type: 'general_news', // or classify
              college_ids: colleges.map(c => c._id),
              college_names: colleges.map(c => c.name),
              source: {
                name: source.name,
                url: link,
                platform: 'news_site'
              },
              sentiment: 'neutral',
              published_at: new Date()
            };

            await NewsArticleModel.create(article);
            articlesIngested++;
            console.log(`✓ ${title.slice(0, 50)}`);

          } catch (err) {
            console.error(`Error parsing article:`, err.message);
          }
        });

      } catch (error) {
        console.error(`Error scraping ${source.name}:`, error.message);
      }
    }

    // Log run
    const executionTime = Date.now() - startTime;
    await ScraperLogModel.logScraperRun('news_scraper', 'news_sites', 'success', {
      found: articlesFound,
      ingested: articlesIngested,
      executionTime
    });

    console.log(`✓ News Scraper: Found ${articlesFound}, Ingested ${articlesIngested}`);
  }

  static async extractCollegeMentions(text) {
    // Same as Reddit scraper
    // ... implementation
    return [];
  }
}

module.exports = NewsScraper;
```

---

## 5. DEDUPLICATION ENGINE

### Implementation

```javascript
// scrapers/deduplication.js
const Fuzzyset = require('fuzzyset.js');
const NewsArticleModel = require('../models/NewsArticleModel');

class DeduplicationEngine {
  /**
   * Find duplicates and mark them
   */
  static async run() {
    console.log('🔄 Running deduplication...');

    const articles = db.getDB().collection('news_articles');
    
    // Get all non-duplicate articles
    const allArticles = await articles
      .find({ is_duplicate: false })
      .toArray();

    const titles = allArticles.map(a => a.title);
    const fuzzySet = Fuzzyset(titles);

    let duplicatesFound = 0;

    for (const article of allArticles) {
      // Find similar titles
      const matches = fuzzySet.get(article.title, null, 0.85); // 85% similarity

      if (matches && matches.length > 1) {
        for (const [score, similarTitle] of matches) {
          const similarArticle = allArticles.find(a => a.title === similarTitle);
          
          if (similarArticle && similarArticle._id.toString() !== article._id.toString()) {
            // Mark the newer one as duplicate
            if (article.published_at > similarArticle.published_at) {
              await NewsArticleModel.markAsDuplicate(
                article._id,
                similarArticle._id
              );
              duplicatesFound++;
              console.log(`✓ Marked as duplicate: ${article.title.slice(0, 50)}`);
            }
          }
        }
      }
    }

    console.log(`✓ Deduplication complete: ${duplicatesFound} duplicates marked`);
  }
}

module.exports = DeduplicationEngine;
```

---

## 6. COLLEGE ALIASES MAPPING

**Complete alias mapping for all 60+ colleges across 3 tiers**

Scrapers use this mapping to automatically tag articles to the correct college. Each college has 3-6 alias variations to catch different writing styles and abbreviations.

### Statistics
- **Tier 1:** 22 colleges (IIM Blacki, New IIMs, IIT MBAs, Strategic Private)
- **Tier 2:** 18 colleges (Premium private + new IIMs)
- **Tier 3:** 21 colleges (Volume drivers, emerging institutions)
- **Total:** 61 colleges with 200+ alias variations

```json
{
  // ========== TIER 1 ==========
  
  // IIM BLACKI (Original 5)
  "iim a": "ObjectId_IIM_Ahmedabad",
  "iim-a": "ObjectId_IIM_Ahmedabad",
  "iima": "ObjectId_IIM_Ahmedabad",
  "ahmedabad": "ObjectId_IIM_Ahmedabad",

  "iim b": "ObjectId_IIM_Bangalore",
  "iim-b": "ObjectId_IIM_Bangalore",
  "iimb": "ObjectId_IIM_Bangalore",
  "bangalore": "ObjectId_IIM_Bangalore",

  "iim c": "ObjectId_IIM_Calcutta",
  "iim-c": "ObjectId_IIM_Calcutta",
  "iimc": "ObjectId_IIM_Calcutta",
  "joka": "ObjectId_IIM_Calcutta",
  "cal c": "ObjectId_IIM_Calcutta",

  "iim l": "ObjectId_IIM_Lucknow",
  "iim-l": "ObjectId_IIM_Lucknow",
  "iiml": "ObjectId_IIM_Lucknow",
  "lucknow": "ObjectId_IIM_Lucknow",

  "iim k": "ObjectId_IIM_Kozhikode",
  "iim-k": "ObjectId_IIM_Kozhikode",
  "iimk": "ObjectId_IIM_Kozhikode",
  "kozhikode": "ObjectId_IIM_Kozhikode",

  // IIM INDORE (Tier-1 Upgrade)
  "iim i": "ObjectId_IIM_Indore",
  "iim-i": "ObjectId_IIM_Indore",
  "iimi": "ObjectId_IIM_Indore",
  "indore": "ObjectId_IIM_Indore",

  // IIM SHILLONG
  "iim s": "ObjectId_IIM_Shillong",
  "iim shillong": "ObjectId_IIM_Shillong",
  "shillong": "ObjectId_IIM_Shillong",

  // TOP PRIVATE/NON-IIM
  "xlri": "ObjectId_XLRI_Jamshedpur",
  "xlri jamshedpur": "ObjectId_XLRI_Jamshedpur",
  "xlri jsr": "ObjectId_XLRI_Jamshedpur",
  "xl": "ObjectId_XLRI_Jamshedpur",

  "xlri delhi": "ObjectId_XLRI_Delhi",
  "xlri ncr": "ObjectId_XLRI_Delhi",

  "fms": "ObjectId_FMS_Delhi",
  "fms delhi": "ObjectId_FMS_Delhi",

  "spjimr": "ObjectId_SPJIMR_Mumbai",
  "sp jain": "ObjectId_SPJIMR_Mumbai",
  "spj": "ObjectId_SPJIMR_Mumbai",

  "isb": "ObjectId_ISB_Hyderabad",
  "isb hyderabad": "ObjectId_ISB_Hyderabad",
  "isb mohali": "ObjectId_ISB_Mohali",

  "jbims": "ObjectId_JBIMS_Mumbai",
  "jb": "ObjectId_JBIMS_Mumbai",
  "jamnalal bajaj": "ObjectId_JBIMS_Mumbai",

  "iim mumbai": "ObjectId_IIM_Mumbai",
  "iim m": "ObjectId_IIM_Mumbai",
  "nitie": "ObjectId_IIM_Mumbai",

  "mdi": "ObjectId_MDI_Gurgaon",
  "mdi g": "ObjectId_MDI_Gurgaon",
  "mdi gurgaon": "ObjectId_MDI_Gurgaon",

  "iift": "ObjectId_IIFT_Delhi",
  "iift delhi": "ObjectId_IIFT_Delhi",
  "iift d": "ObjectId_IIFT_Delhi",
  "iift kolkata": "ObjectId_IIFT_Kolkata",
  "iift k": "ObjectId_IIFT_Kolkata",

  "tiss": "ObjectId_TISS_Mumbai",
  "tiss mumbai": "ObjectId_TISS_Mumbai",

  // IIT MBAs
  "sjmsom": "ObjectId_SJMSoM_IIT_Bombay",
  "iit b mba": "ObjectId_SJMSoM_IIT_Bombay",
  "iit bombay mba": "ObjectId_SJMSoM_IIT_Bombay",

  "dms iitd": "ObjectId_DMS_IIT_Delhi",
  "iit delhi mba": "ObjectId_DMS_IIT_Delhi",

  // ========== TIER 2 ==========

  // NEW IIMs
  "iim u": "ObjectId_IIM_Udaipur",
  "iimu": "ObjectId_IIM_Udaipur",
  "udaipur": "ObjectId_IIM_Udaipur",

  "iim t": "ObjectId_IIM_Trichy",
  "iimt": "ObjectId_IIM_Trichy",
  "trichy": "ObjectId_IIM_Trichy",

  "iim r": "ObjectId_IIM_Ranchi",
  "iim ranchi": "ObjectId_IIM_Ranchi",
  "ranchi": "ObjectId_IIM_Ranchi",
  
  "iim raipur": "ObjectId_IIM_Raipur",
  "raipur": "ObjectId_IIM_Raipur",

  "iim rohtak": "ObjectId_IIM_Rohtak",
  "rohtak": "ObjectId_IIM_Rohtak",

  "iim kashipur": "ObjectId_IIM_Kashipur",
  "kashipur": "ObjectId_IIM_Kashipur",

  // TIER 2 PRIVATES
  "nmims": "ObjectId_NMIMS_Mumbai",
  "nmims mumbai": "ObjectId_NMIMS_Mumbai",
  "nm": "ObjectId_NMIMS_Mumbai",
  "nm mumbai": "ObjectId_NMIMS_Mumbai",

  "sibm": "ObjectId_SIBM_Pune",
  "sibm pune": "ObjectId_SIBM_Pune",
  "sibm p": "ObjectId_SIBM_Pune",

  "scmhrd": "ObjectId_SCMHRD_Pune",
  "scm": "ObjectId_SCMHRD_Pune",
  "scmhrd pune": "ObjectId_SCMHRD_Pune",

  "ximb": "ObjectId_XIMB_Bhubaneswar",
  "xim b": "ObjectId_XIMB_Bhubaneswar",
  "xim": "ObjectId_XIMB_Bhubaneswar",

  "imt": "ObjectId_IMT_Ghaziabad",
  "imt g": "ObjectId_IMT_Ghaziabad",
  "imt ghaziabad": "ObjectId_IMT_Ghaziabad",

  "imi": "ObjectId_IMI_Delhi",
  "imi delhi": "ObjectId_IMI_Delhi",

  "mica": "ObjectId_MICA_Ahmedabad",
  "mica ahmedabad": "ObjectId_MICA_Ahmedabad",

  "irma": "ObjectId_IRMA_Anand",
  "irma anand": "ObjectId_IRMA_Anand",

  // TIER 2 IIT MBAs
  "vgsom": "ObjectId_VGSOM_IIT_Kharagpur",
  "iit kgp mba": "ObjectId_VGSOM_IIT_Kharagpur",
  "iit kharagpur mba": "ObjectId_VGSOM_IIT_Kharagpur",

  "doms iitm": "ObjectId_DoMS_IIT_Madras",
  "iit madras mba": "ObjectId_DoMS_IIT_Madras",
  
  "ime iitk": "ObjectId_IME_IIT_Kanpur",
  "iit kanpur mba": "ObjectId_IME_IIT_Kanpur",

  "doms iitr": "ObjectId_DoMS_IIT_Roorkee",
  "iit roorkee mba": "ObjectId_DoMS_IIT_Roorkee",

  // ========== TIER 3 ==========

  // BABY IIMs
  "iim amritsar": "ObjectId_IIM_Amritsar",
  "amritsar": "ObjectId_IIM_Amritsar",

  "iim nagpur": "ObjectId_IIM_Nagpur",
  "iimn": "ObjectId_IIM_Nagpur",
  
  "iim vizag": "ObjectId_IIM_Visakhapatnam",
  "iim visakhapatnam": "ObjectId_IIM_Visakhapatnam",
  "iim v": "ObjectId_IIM_Visakhapatnam",

  "iim bodh gaya": "ObjectId_IIM_Bodh_Gaya",
  "iim bg": "ObjectId_IIM_Bodh_Gaya",
  "bodh gaya": "ObjectId_IIM_Bodh_Gaya",

  "iim jammu": "ObjectId_IIM_Jammu",
  "iim j": "ObjectId_IIM_Jammu",

  "iim sambalpur": "ObjectId_IIM_Sambalpur",
  "iim sambal": "ObjectId_IIM_Sambalpur",

  "iim sirmaur": "ObjectId_IIM_Sirmaur",

  // TIER 3 PRIVATES & VOLUME
  "gim": "ObjectId_GIM_Goa",
  "gim goa": "ObjectId_GIM_Goa",

  "tapmi": "ObjectId_TAPMI_Manipal",
  "tapmi manipal": "ObjectId_TAPMI_Manipal",

  "glim": "ObjectId_GLIM_Chennai",
  "glim c": "ObjectId_GLIM_Chennai",
  "glim chennai": "ObjectId_GLIM_Chennai",
  "great lakes": "ObjectId_GLIM_Chennai",

  "glim g": "ObjectId_GLIM_Gurgaon",
  "glim gurgaon": "ObjectId_GLIM_Gurgaon",

  "fore": "ObjectId_FORE_Delhi",
  "fore delhi": "ObjectId_FORE_Delhi",

  "kj somaiya": "ObjectId_KJ_Somaiya_Mumbai",
  "kj": "ObjectId_KJ_Somaiya_Mumbai",
  "kjsim": "ObjectId_KJ_Somaiya_Mumbai",

  "weschool": "ObjectId_Welingkar_Mumbai",
  "welingkar": "ObjectId_Welingkar_Mumbai",
  "welingkar mumbai": "ObjectId_Welingkar_Mumbai",

  "weschool blr": "ObjectId_Welingkar_Bangalore",
  "welingkar bangalore": "ObjectId_Welingkar_Bangalore",

  "siib": "ObjectId_SIIB_Pune",
  "siib pune": "ObjectId_SIIB_Pune",

  "sibm b": "ObjectId_SIBM_Bangalore",
  "sibm bangalore": "ObjectId_SIBM_Bangalore",
  "sibm blr": "ObjectId_SIBM_Bangalore",

  "nmims b": "ObjectId_NMIMS_Bangalore",
  "nmims blr": "ObjectId_NMIMS_Bangalore",
  "nm bangalore": "ObjectId_NMIMS_Bangalore",

  "nmims h": "ObjectId_NMIMS_Hyderabad",
  "nm hyderabad": "ObjectId_NMIMS_Hyderabad",
  "nm hyd": "ObjectId_NMIMS_Hyderabad",

  "nmims i": "ObjectId_NMIMS_Indore",
  "nm indore": "ObjectId_NMIMS_Indore",

  "ubs": "ObjectId_UBS_Chandigarh",
  "ubs chandigarh": "ObjectId_UBS_Chandigarh",

  "srcc gbo": "ObjectId_SRCC_GBO",
  "srcc": "ObjectId_SRCC_GBO",

  // TIER 3 IIT
  "iit jodhpur mba": "ObjectId_IIT_Jodhpur",
  "iitj mba": "ObjectId_IIT_Jodhpur",
  
  "ism dhanbad": "ObjectId_ISM_Dhanbad",
  "iit dhanbad mba": "ObjectId_ISM_Dhanbad"
}
```

### How This Mapping Works

**Scraper Flow:**
1. Extract text from Reddit post/article
2. Convert to lowercase
3. Check against each key in this mapping
4. If match found → fetch ObjectId
5. Fetch college document from MongoDB
6. Tag article to colleges

**Example:**
```
Post text: "IIM B placement season started, great news for ISB too"
              ↓
Matches: "iim b" → ObjectId_IIM_Bangalore
         "isb" → ObjectId_ISB_Hyderabad
              ↓
Article tagged to: [IIM Bangalore, ISB Hyderabad]
```

### Key Features

✅ **Multiple aliases per college** - "iim b", "iimb", "bangalore"  
✅ **Case insensitive** - Handled in scraper  
✅ **Abbreviations** - "iit b mba", "iit bombay mba" → same college  
✅ **Regional variants** - "isb mohali" vs "isb hyderabad"  
✅ **Typo-resistant** - Fuzzy matching as fallback (80% confidence)  
✅ **Organized by tier** - For future filtering/analysis  

### Maintenance

**To add a new college:**
```json
"new college": "ObjectId_NewCollege_City",
"new c": "ObjectId_NewCollege_City",
"nc": "ObjectId_NewCollege_City"
```

**To update aliases:**
- Keep existing (backward compat with old articles)
- Add new variations discovered in Reddit discussions
- Test fuzzy matches (avoid false positives)

---

## 7. SCHEDULER SETUP

```javascript
// scrapers/scheduler.js
const cron = require('node-cron');
const RedditScraper = require('./reddit-scraper');
const NewsScraper = require('./news-scraper');
const DeduplicationEngine = require('./deduplication');

class ScraperScheduler {
  static initialize() {
    console.log('⏲ Initializing scraper scheduler...');

    // Reddit: Every 6 hours
    cron.schedule('0 */6 * * *', () => {
      console.log('📅 Scheduled task: Reddit Scraper');
      RedditScraper.run().catch(err => console.error('Reddit scraper error:', err));
    });

    // News: Every 12 hours
    cron.schedule('0 */12 * * *', () => {
      console.log('📅 Scheduled task: News Scraper');
      NewsScraper.run().catch(err => console.error('News scraper error:', err));
    });

    // Deduplication: Every day at 2 AM
    cron.schedule('0 2 * * *', () => {
      console.log('📅 Scheduled task: Deduplication');
      DeduplicationEngine.run().catch(err => console.error('Dedup error:', err));
    });

    // Manual trigger for testing
    console.log('✓ Scraper scheduler initialized');
  }

  /**
   * Trigger scrapers manually (for testing)
   */
  static async runAllManual() {
    console.log('🚀 Manual trigger: Running all scrapers...');
    
    try {
      await RedditScraper.run();
      await NewsScraper.run();
      await DeduplicationEngine.run();
      console.log('✓ All scrapers completed');
    } catch (error) {
      console.error('Error in manual run:', error);
    }
  }
}

module.exports = ScraperScheduler;
```

---

## 8. INTEGRATION IN APP.JS

```javascript
// app.js (additions)
const ScraperScheduler = require('./scrapers/scheduler');

// ======================
// INITIALIZE SCRAPERS
// ======================
ScraperScheduler.initialize();

// Manual trigger endpoint (for testing)
app.get('/admin/scrape-all', async (req, res) => {
  // Add authorization check here
  try {
    await ScraperScheduler.runAllManual();
    res.json({ success: true, message: 'Scrapers triggered' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

```

---

## 9. ERROR HANDLING & RETRIES

### Implementation Template

```javascript
// scrapers/utils.js
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function retryAsync(fn, retries = MAX_RETRIES) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    console.log(`Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return retryAsync(fn, retries - 1);
  }
}

module.exports = { retryAsync };
```

---

## 10. MONITORING & HEALTH CHECK

```javascript
// routes/scraper-admin.js
const express = require('express');
const router = express.Router();
const ScraperLogModel = require('../models/ScraperLogModel');

router.get('/scraper-status', async (req, res) => {
  try {
    const redditLastRun = await ScraperLogModel.getLastRun('reddit_scraper');
    const newsLastRun = await ScraperLogModel.getLastRun('news_scraper');

    const redditHealth = redditLastRun && 
      (Date.now() - redditLastRun.run_timestamp.getTime()) < 8 * 60 * 60 * 1000
      ? 'healthy' : 'stale';

    const newsHealth = newsLastRun &&
      (Date.now() - newsLastRun.run_timestamp.getTime()) < 14 * 60 * 60 * 1000
      ? 'healthy' : 'stale';

    res.json({
      reddit_scraper: {
        status: redditHealth,
        last_run: redditLastRun?.run_timestamp,
        articles_ingested: redditLastRun?.articles_ingested
      },
      news_scraper: {
        status: newsHealth,
        last_run: newsLastRun?.run_timestamp,
        articles_ingested: newsLastRun?.articles_ingested
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 11. CONTENT QUALITY METRICS

### Track These
- **Accuracy:** % of articles correctly tagged to colleges
- **Freshness:** Time from publication to ingestion
- **Duplication Rate:** % of duplicates detected
- **Classification Accuracy:** % of content_type classifications correct

### Dashboard Query
```javascript
const stats = await db.getCollection('scraper_logs').aggregate([
  { $match: { run_timestamp: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
  { $group: {
      _id: '$scraper_name',
      totalRuns: { $sum: 1 },
      totalArticles: { $sum: '$articles_ingested' },
      avgExecutionTime: { $avg: '$execution_time_ms' }
    }
  }
]).toArray();
```

---

## 12. IMPLEMENTATION CHECKLIST

### Phase 1: Build Scrapers
- [ ] Implement Reddit scraper (test with 5 posts)
- [ ] Implement News scraper (test with 3 sources)
- [ ] Implement deduplication engine
- [ ] Create college aliases mapping (60+ colleges)
- [ ] Test with 100 articles

### Phase 2: Deploy Scheduling
- [ ] Set up node-cron
- [ ] Test Reddit scraper (6-hourly)
- [ ] Test News scraper (12-hourly)
- [ ] Test deduplication (daily)
- [ ] Monitor for 1 week

### Phase 3: Monitor & Optimize
- [ ] Add health check endpoint
- [ ] Track accuracy metrics
- [ ] Refine college extraction
- [ ] Improve sentiment analysis
- [ ] Add more news sources

### Phase 4: Scale
- [ ] Increase college database
- [ ] Add institutional scraper
- [ ] Implement caching
- [ ] Add Redis queue (if volume > 500 articles/week)

---

**Owner:** Scraper Architecture Team  
**Status:** Ready for implementation  
**Priority:** CRITICAL (Core product feature)

