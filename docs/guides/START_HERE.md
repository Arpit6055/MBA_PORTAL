# 🚀 START HERE - EVERYTHING YOU NEED

**Simplified. Minimal. Just what you need to run the app.**

---

## ⚡ THE ABSOLUTE MINIMUM (5 minutes)

If you're in a hurry, just run these 4 commands:

```bash
npm install
npm run init-db
npm start
```

Go to http://localhost:3000 and you're done! 🎉

---

## 📋 WHAT EACH COMMAND DOES

### `npm install`
Installs all code dependencies. Only needed once.

### `npm run init-db`
Creates MongoDB database with 60 colleges. Only needed once.

### `npm start`
Launches the server on http://localhost:3000

### `npm run dev`
Same as start, but auto-reloads when you change code.

### `npm run scrape`
Fetches latest articles from Reddit & news sites (takes 30-60 sec).

### `npm run test-api`
Verifies everything is working.

---

## ⚙️ FULL SETUP (First Time Only)

### Step 1: Get to Project
```bash
cd c:\Users\arpit\Desktop\New\ folder
```

### Step 2: Create .env File
Create a file named `.env` (copy exactly):
```
MONGODB_URI=mongodb://localhost:27017
DB_NAME=mba_portal
SECRET_KEY=mba_secret_2024
NODE_ENV=development
PORT=3000
```

### Step 3: Install MongoDB
**Option A - Local (on your computer):**
- Download: https://www.mongodb.com/try/download/community
- Install it
- Run `mongod` in a terminal
- Keep it running in background

**Option B - Cloud (easier, free):**
- Go to: https://www.mongodb.com/cloud/atlas
- Create free account
- Create free cluster
- Copy connection string
- Paste into .env as MONGODB_URI

### Step 4: Install Dependencies
```bash
npm install
```
(Takes 2-3 minutes, only needed once)

### Step 5: Setup Database
```bash
npm run init-db
```
(Takes 30 seconds, only needed once)

### Step 6: Start Server
```bash
npm start
```

**Done!** Open browser: http://localhost:3000

---

## 🎯 COMMON WORKFLOWS

### Workflow A: Just Running It
**Terminal 1:**
```bash
npm start
```
Open: http://localhost:3000

### Workflow B: Development (Recommended)
**Terminal 1 - Server (auto-reloads when you code):**
```bash
npm run dev
```

**Terminal 2 - Scraper (get content):**
```bash
npm run scrape
```

**Terminal 3 - Testing (verify APIs work):**
```bash
npm run test-api
```

### Workflow C: Complete Automated Setup
**Windows (PowerShell):**
```bash
.\setup.ps1
```

**Mac/Linux (Bash):**
```bash
bash setup.sh
```
(These scripts do everything interactively)

---

## 📚 ALL COMMANDS

| What | Command |
|------|---------|
| Install once | `npm install` |
| Setup database | `npm run init-db` |
| Start server | `npm start` |
| Start + auto-reload | `npm run dev` |
| Get articles | `npm run scrape` |
| Test everything | `npm run test-api` |
| Check health | `npm run health` |
| Stop server | `npm stop` |
| Reset all data | `npm run reset-db` |
| Interactive menu | `.\setup.ps1` (Windows) or `bash setup.sh` (Mac/Linux) |

---

## ✅ HOW TO VERIFY IT WORKS

### Check 1: Homepage
```
Visit: http://localhost:3000
You should see: College list, search bar, trending section
```

### Check 2: Search
```
Type "IIM B" in search
You should see: IIM Bangalore, IIM Bombay, etc.
```

### Check 3: Get Articles
```bash
npm run scrape
# Wait 30-60 seconds
# Then visit: http://localhost:3000/api/news
```

### Check 4: Database
```bash
mongosh
db.colleges.countDocuments()  # Should show ~60

db.news_articles.countDocuments()  # Should grow after scrape
```

---

## 🐛 QUICK FIXES IF SOMETHING BREAKS

| Problem | Fix |
|---------|-----|
| "Port 3000 in use" | `npm stop` first or restart computer |
| "Can't connect to MongoDB" | Make sure `mongod` or cloud connection works |
| "Database is empty" | Run `npm run init-db` |
| "No articles showing" | Run `npm run scrape` |
| "Page won't load" | Check http://localhost:3000 (must be on port 3000) |
| Server crashes | Check `.env` file has all required fields |

---

## 🎓 FOLDER STRUCTURE (Important Files Only)

```
YOUR PROJECT/
├── app.js                    ← Main server file
├── package.json              ← Dependencies & commands
├── .env                      ← Your configuration (create this!)
├── setup.ps1                 ← Auto-setup script (Windows)
├── setup.sh                  ← Auto-setup script (Mac/Linux)
│
├── config/
│   └── db.js                 ← Database connection
│
├── models/
│   ├── CollegeModel.js       ← College operations
│   ├── NewsArticleModel.js   ← News operations
│   └── UserModel.js          ← User operations
│
├── routes/
│   └── authRoutes.js         ← Login/auth endpoints
│
├── controllers/
│   └── authController.js     ← Auth logic
│
├── scrapers/
│   ├── reddit-scraper.js     ← Reddit fetching
│   ├── news-scraper.js       ← News fetching
│   └── scheduler.js          ← Auto-running
│
├── scripts/
│   ├── init-db.js            ← Setup database
│   ├── reset-db.js           ← Clear database
│   ├── run-scraper.js        ← Run all scrapers
│   └── test-api.js           ← Test endpoints
│
└── views/
    ├── index.pug             ← Homepage
    ├── layout.pug            ← Template
    └── ...more pages
```

---

## 💡 PRO TIPS

**Tip 1: Use cloud database**
- Easier than installing locally
- Free tier is plenty
- Works from anywhere

**Tip 2: Keep 3 terminals open**
- Terminal 1: `npm run dev` (server)
- Terminal 2: Manual commands
- Terminal 3: Monitoring

**Tip 3: Test as you code**
```bash
curl "http://localhost:3000/api/colleges?search=IIM"
```

**Tip 4: Check logs**
```bash
tail -f logs/app.log  # View real-time logs
```

---

## 🎬 QUICK START (Copy & Paste)

### Windows PowerShell
```powershell
# One-time:
npm install
npm run init-db

# Then always:
npm start

# In another terminal when needed:
npm run scrape
```

### Mac/Linux Bash
```bash
# One-time:
npm install
npm run init-db

# Then always:
npm start

# In another terminal when needed:
npm run scrape
```

---

## 📞 NEED DETAILED INFO?

| Question | Read This |
|----------|-----------|
| What are ALL the commands? | QUICK_START.md |
| How do APIs work? | API_ROUTES.md |
| What's the database structure? | DATABASE_SCHEMAS.md |
| How do scrapers work? | SCRAPER_ARCHITECTURE.md |
| What's the overall plan? | ARCHITECTURE_REDESIGN.md |
| How to implement properly? | IMPLEMENTATION_ROADMAP.md |

**But you probably don't need any of those right now.**

---

## ✨ YOU'RE READY!

Just run:
```bash
npm install
npm run init-db
npm start
```

Then visit: http://localhost:3000

**That's it!** 🚀

---

**Time:** 5-15 minutes to running  
**Difficulty:** Very easy  
**Knowledge needed:** None (just follow steps)

