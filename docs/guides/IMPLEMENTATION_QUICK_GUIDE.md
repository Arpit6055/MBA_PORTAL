# IMPLEMENTATION QUICK START

**Start here. Everything else is reference.**

---

## 🎯 GOAL: Get the app running in 30 minutes

---

## Step 1: One-Time Setup (5 minutes)

```bash
# Clone/go to project
cd c:\Users\arpit\Desktop\New\ folder

# Install everything
npm install

# Create config file
# Create a file called .env with this content:
MONGODB_URI=mongodb://localhost:27017
DB_NAME=mba_portal
SECRET_KEY=mba_portal_secret_2024
NODE_ENV=development
PORT=3000
```

---

## Step 2: Start MongoDB (2 minutes)

**Option A: Local MongoDB**
```bash
# Install from: https://www.mongodb.com/try/download/community
# Then in a separate terminal:
mongod
```

**Option B: Cloud MongoDB (Easier)**
- Go to: https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Copy connection string
- Replace MONGODB_URI in .env

---

## Step 3: Initialize Database (3 minutes)

```bash
npm run init-db
```

**Expected output:**
```
✓ Connected to MongoDB
✓ Colleges collection created with 60 colleges
✓ News articles collection created
✓ Users collection created
✓ Scraper logs collection created
✓ All indexes created
```

---

## Step 4: Start Server (2 minutes)

```bash
npm start
```

**Expected output:**
```
✓ Express server listening on port 3000
Click: http://localhost:3000
```

Open browser → http://localhost:3000

You should see the homepage with colleges and news.

---

## Step 5: Test Everything (5 minutes)

**In a new terminal:**

```bash
# Test all APIs
npm run test-api

# Or manually fetch articles
npm run scrape

# Or check server health
npm run health
```

---

## 🚀 That's it! You're done.

**The server is now running:**
- ✅ Homepage with 60+ colleges
- ✅ College search & filtering
- ✅ News feed (empty until you scrape)
- ✅ Authentication ready
- ✅ Scrapers ready to run

---

## 💡 Next: Start Developing

### Daily Workflow

**Terminal 1 - Server (Auto-reload):**
```bash
npm run dev
```

**Terminal 2 - Scraper (Manual trigger):**
```bash
npm run scrape
```

**Terminal 3 - Testing:**
```bash
npm run test-api
```

---

## 📋 All Available Commands

| Command | What It Does | When |
|---------|---|---|
| `npm install` | Install dependencies | First time only |
| `npm start` | Start server | Always |
| `npm run dev` | Start with auto-reload | During development |
| `npm run init-db` | Create database + seed | First time |
| `npm run reset-db` | Delete all data | Need fresh start |
| `npm run scrape` | Fetch Reddit + News articles | Get content |
| `npm run test-api` | Test all endpoints | Verify working |
| `npm run health` | Check scraper status | Debug issues |
| `npm stop` | Stop server | Cleanup |

---

## 🔍 Verify Everything Works

### 1. Homepage Loads
```
Visit: http://localhost:3000
You should see: College list, search bar, trending section
```

### 2. Search Works
```
Click search → Type "IIM B"
You should see: IIM Bangalore, IIM Bombay, etc.
```

### 3. Scraper Works
```bash
npm run scrape
# Wait 30-60 seconds
# Then visit: http://localhost:3000/api/news
# You should see articles
```

### 4. Database Connected
```bash
mongosh
db.colleges.countDocuments()  # Should show 60
db.news_articles.countDocuments()  # Should grow after scrape
```

---

## 🐛 Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3000 already in use | `npm stop` first or `lsof -ti:3000 \| xargs kill -9` |
| MongoDB connection error | Make sure `mongod` is running in another terminal |
| Colleges not showing | Run `npm run init-db` again |
| Articles not fetching | Run `npm run scrape` manually |
| Server won't start | Check `.env` file has all values |

---

## 📁 What Gets Created

**After `npm run init-db`:**
```
MongoDB Collections:
  ✓ colleges (60 colleges with details)
  ✓ news_articles (empty, filled by scraper)
  ✓ users (empty, filled by registration)
  ✓ scraper_logs (tracks scraper runs)
```

**After `npm run scrape`:**
```
100+ articles in news_articles collection
Tagged to correct colleges automatically
```

---

## 🔧 Customization (Optional)

### Change port
Edit `.env`:
```
PORT=5000
```

### Use cloud database
Edit `.env`:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mba_portal
```

### Disable auto-scraper
Edit `app.js`, comment out:
```javascript
// ScraperScheduler.initialize();
```

### Add more colleges
Edit `scripts/init-db.js`, add to COLLEGES_SEED_DATA array

---

## 📚 When You Need More Details

| Topic | Document |
|-------|----------|
| All API endpoints | API_ROUTES.md |
| Database structure | DATABASE_SCHEMAS.md |
| How scrapers work | SCRAPER_ARCHITECTURE.md |
| Full architecture | ARCHITECTURE_REDESIGN.md |
| Implementation plan | IMPLEMENTATION_ROADMAP.md |
| Simple quick reference | **← You're here (QUICK_START.md)** |

---

## ✅ Once It's Running

### Development
- Edit files in `routes/`, `models/`, `views/`
- Server auto-reloads (thanks nodemon)
- Changes visible immediately

### Adding Features
1. Create route in `routes/`
2. Add model in `models/`
3. Update view in `views/`
4. Test with curl or Postman

### Deploying
```bash
# When ready to deploy:
NODE_ENV=production npm start
```

---

## 🎓 Learning Path (If Interested)

**Day 1:** Just run it. See it work.
```bash
npm install && npm run init-db && npm start
```

**Day 2:** Understand the code.
- Look at `app.js` (server setup)
- Look at `routes/authRoutes.js` (endpoints)
- Look at `models/CollegeModel.js` (database)

**Day 3:** Run scrapers & see articles populate.
```bash
npm run scrape
npm run test-api
```

**Day 4:** Read the docs if curious.
- ARCHITECTURE_REDESIGN.md for strategy
- SCRAPER_ARCHITECTURE.md for how it works

---

## 💬 Questions?

- **"How do I...?"** → Check QUICK_START.md (this file)
- **"The API does what?"** → Check API_ROUTES.md
- **"How does scraping work?"** → Check SCRAPER_ARCHITECTURE.md
- **"What's the overall plan?"** → Check ARCHITECTURE_REDESIGN.md

---

## 🚀 SUCCESS CHECKLIST

- [ ] MongoDB running
- [ ] npm install completed
- [ ] .env file created
- [ ] npm run init-db successful
- [ ] npm start running on port 3000
- [ ] Homepage loads in browser
- [ ] College search works
- [ ] npm run scrape completes
- [ ] Articles show in news feed
- [ ] npm run test-api passes

**Once all checked: You're ready to code!** 🎉

---

**Time to get running:** ~30 minutes  
**Time to understand:** ~2 hours  
**Time to modify:** Immediate  

---

**Version:** 1.0  
**Date:** February 14, 2026

