# MBA Portal - Quick Start Guide

**One file. Simple commands. Everything you need.**

---

## ⚡ TL;DR - Just Run These

```bash
# 1. INSTALL DEPENDENCIES
npm install

# 2. SETUP DATABASE & SEED COLLEGES
npm run init-db

# 3. START SERVER
npm start

# 4. RUN SCRAPER (in another terminal)
npm run scrape

# 5. TEST APIs
npm run test-api

# 6. STOP EVERYTHING
npm stop
```

That's it. Everything else in the docs is optional context.

---

## 📋 WHAT EACH COMMAND DOES

### `npm install`
- Installs all dependencies from package.json
- Takes ~2-3 minutes
- Only run once, when starting fresh

### `npm run init-db`
- Creates MongoDB collections (colleges, news_articles, users, scraper_logs)
- Seeds 60+ colleges into the database
- Creates proper indexes
- Ready for scraping

### `npm start`
- Starts the Express server on http://localhost:3000
- Initializes scraper scheduler (runs automatically)
- Logs all requests

### `npm run scrape`
- Manually triggers all scrapers (Reddit + News)
- Fetches ~50-100 articles
- Tags colleges automatically
- Takes ~30-60 seconds
- Can run while server is running

### `npm run test-api`
- Tests all public APIs
- Verifies college search, news feed, sorting
- Shows response times
- Confirms integration is working

### `npm stop`
- Gracefully shuts down server

---

## 🚀 STEP-BY-STEP SETUP (First Time Only)

### Step 1: Install All Dependencies
```bash
npm install
```

**What gets installed:**
- Express (web framework)
- MongoDB (database)
- Puppeteer & Cheerio (scrapers)
- node-cron (scheduling)
- Pug (templates)

### Step 2: Create .env File
Create a file called `.env` in the root folder:
```
MONGODB_URI=mongodb://localhost:27017
DB_NAME=mba_portal
SECRET_KEY=your_secret_key_here
NODE_ENV=development
PORT=3000
```

### Step 3: Start MongoDB (if local)
```bash
# On Windows with MongoDB installed
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env to your cloud connection string
```

### Step 4: Initialize Database
```bash
npm run init-db
```
Output:
```
✓ Connected to MongoDB database: mba_portal
✓ Colleges collection initialized
✓ News articles collection initialized
✓ Scrapers logs collection initialized
✓ Seeded 60 colleges
✓ All indexes created
```

### Step 5: Start Server
```bash
npm start
```
Output:
```
✓ Connected to MongoDB database: mba_portal
✓ Express server listening on port 3000
✓ Scraper scheduler initialized
```

### Step 6: Test in Browser
Open: http://localhost:3000

You should see:
- Homepage with college listing
- Search bar
- News feed

---

## 🔄 DAILY WORKFLOW

### Development Mode (Auto-reload on file changes)
```bash
npm run dev
```

### Run Scraper Manually
```bash
npm run scrape
```

Fetches latest:
- Reddit posts from r/CATpreparation, r/MBA
- News from The Hindu, Economic Times
- Tags colleges automatically
- Deduplicates articles

### Check Scraper Health
```bash
curl http://localhost:3000/admin/scraper-status
```

Response:
```json
{
  "reddit_scraper": {
    "status": "healthy",
    "last_run": "2026-02-14T10:30:00Z",
    "articles_ingested": 47
  },
  "news_scraper": {
    "status": "healthy",
    "last_run": "2026-02-14T10:00:00Z",
    "articles_ingested": 23
  }
}
```

### View Logs
```bash
# All logs
tail -f logs/app.log

# Just errors
tail -f logs/error.log

# Just scrapers
tail -f logs/scraper.log
```

---

## 🧪 TESTING COMMANDS

### Test APIs from Command Line

#### 1. Get All Colleges (with filters)
```bash
curl "http://localhost:3000/api/colleges?tier=Tier-1:%20IIM%20Blacki&limit=5"
```

#### 2. Search Colleges
```bash
curl "http://localhost:3000/api/colleges/search?q=IIM%20B"
```

#### 3. Get College Details
```bash
curl "http://localhost:3000/api/colleges/507f1f77bcf86cd799439011"
```

#### 4. Get News Feed
```bash
curl "http://localhost:3000/api/news?limit=10"
```

#### 5. Get Trending Colleges
```bash
curl "http://localhost:3000/api/trending-colleges?limit=5"
```

#### 6. Run All Tests
```bash
npm run test
```

---

## 📊 DATABASE COMMANDS

### View Data in MongoDB

#### Connect to Database
```bash
# If using local MongoDB
mongosh

# Or use MongoDB Compass GUI (visual interface)
# Download: https://www.mongodb.com/products/compass
```

#### Common Queries

**Count colleges:**
```bash
db.colleges.countDocuments()  # Should show ~60
```

**View first college:**
```bash
db.colleges.findOne()
```

**Count articles:**
```bash
db.news_articles.countDocuments()  # Shows total articles
```

**Find articles from a college:**
```bash
db.news_articles.find({ college_names: "IIM Bangalore" }).limit(5)
```

**Check scraper logs:**
```bash
db.scraper_logs.find().sort({ run_timestamp: -1 }).limit(5)
```

---

## 🐛 TROUBLESHOOTING

### Server won't start
```bash
# Check if port 3000 is already in use
# Kill the process:
lsof -ti:3000 | xargs kill -9

# Then try again:
npm start
```

### MongoDB connection error
```bash
# Make sure MongoDB is running
mongod  # Start it in another terminal

# Or check your .env file
cat .env  # Verify MONGODB_URI is correct
```

### Scraper not fetching articles
```bash
# Check if it's rate-limited
npm run scrape

# View scraper logs
tail -f logs/scraper.log

# Check Reddit API status
curl https://www.reddit.com/r/CATpreparation/new.json
```

### Colleges not showing in search
```bash
# Verify colleges were seeded
mongosh
db.colleges.countDocuments()  # Should be ~60

# If 0, re-seed:
npm run init-db
```

---

## 📈 MONITORING

### Real-time Server Logs
```bash
npm run dev  # Includes file watching + logs
```

### API Response Times
```bash
npm run test-api  # Shows timing for each endpoint
```

### Database Stats
```bash
mongosh
db.stats()
db.colleges.stats()
db.news_articles.stats()
```

### Scraper Performance
```bash
curl http://localhost:3000/admin/scraper-status | jq
```

---

## 🔧 CONFIGURATION

### Change Server Port
Edit `.env`:
```
PORT=5000
```

### Change Database
Edit `.env`:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mba_portal
```

### Disable Scraper Auto-run
Edit `app.js`:
```javascript
// Comment out this line:
// ScraperScheduler.initialize();
```

### Change Scraper Schedule
Edit `scrapers/scheduler.js`:
```javascript
// Reddit every 6 hours -> change to every 2 hours
cron.schedule('0 */2 * * *', () => {
  RedditScraper.run();
});
```

---

## 📁 FILE STRUCTURE (IMPORTANT FILES ONLY)

```
app.js                          # Main server
package.json                    # Dependencies + scripts
.env                           # Configuration

config/
  db.js                        # Database connection

models/
  CollegeModel.js              # College operations
  NewsArticleModel.js          # Article operations
  UserModel.js                 # User operations

controllers/
  authController.js            # Authentication

routes/
  authRoutes.js                # Auth endpoints

scrapers/
  reddit-scraper.js            # Reddit -> articles
  news-scraper.js              # News -> articles
  scheduler.js                 # Automated running

scripts/
  init-db.js                   # Setup database
  test-setup.js                # Test everything
```

---

## 🎯 COMMON WORKFLOWS

### Workflow 1: Development (Every Day)
```bash
# Terminal 1: Database
mongod

# Terminal 2: Server
npm run dev

# Terminal 3: Manual scraper (when needed)
npm run scrape

# Terminal 4: Testing
npm run test-api
```

### Workflow 2: Production Deployment
```bash
# Setup once
npm install
npm run init-db

# Start server
NODE_ENV=production npm start

# Scrapers run automatically (scheduled)
# Monitor health:
curl http://localhost:3000/admin/scraper-status
```

### Workflow 3: Testing New Feature
```bash
# In one terminal:
npm run dev

# In another terminal:
# Test your API with curl or Postman
curl "http://localhost:3000/api/colleges?search=IIM"

# Check logs
tail -f logs/app.log
```

### Workflow 4: Full Reset
```bash
# Delete all data
npm run reset-db

# Re-seed everything
npm run init-db

# Restart server
npm start
```

---

## 🚨 COMMON ISSUES & FIXES

| Issue | Command to Fix |
|-------|---|
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` |
| MongoDB not running | `mongod` |
| Colleges not found | `npm run init-db` |
| Scraper errors | `npm run scrape -- --debug` |
| Database corrupted | `npm run reset-db && npm run init-db` |
| Memory leak | `npm restart` or `npm stop && npm start` |

---

## 📞 QUICK REFERENCE

| Need | Command |
|------|---------|
| Start everything | `npm start` |
| Restart server | `npm restart` |
| Run tests | `npm test` |
| Fetch articles | `npm run scrape` |
| Check health | `curl localhost:3000/admin/scraper-status` |
| View logs | `tail -f logs/app.log` |
| Reset database | `npm run reset-db` |
| View colleges | `mongosh` then `db.colleges.find()` |

---

## 📚 WHERE TO GO FOR MORE DETAILS

- **Database structure?** → DATABASE_SCHEMAS.md
- **API endpoints?** → API_ROUTES.md
- **Scraper logic?** → SCRAPER_ARCHITECTURE.md
- **Overall strategy?** → ARCHITECTURE_REDESIGN.md
- **Implementation plan?** → IMPLEMENTATION_ROADMAP.md

**But honestly, start with these commands. You don't need to read those yet.**

---

**Version:** 1.0  
**Date:** February 14, 2026  
**Status:** Ready to use

Run `npm start` and you're done! 🚀

