# 🎯 Quick Setup Guide - Scripts Explained Simply

## 🤔 What's the difference?

You have **2 important scripts**:

### 📦 **init-db.js** - Setup Database
- ✅ Run: **Once** during initial setup
- 📍 Location: `scripts/init-db.js`
- 🎯 Creates: MongoDB collections (tables)
- ⏱️ When: After `.env` is ready
- ⚡ Command: `npm run init-db`

### ✅ **test-setup.js** - Test Everything Works
- ✅ Run: **Multiple times** (especially before starting app)
- 📍 Location: `scripts/test-setup.js`
- 🎯 Tests: DB connection, Email config, Sends test email
- ⏱️ When: After setup or when troubleshooting
- ⚡ Command: `npm run test-setup`

---

## 🚀 Simple 5-Step Setup Process

```
STEP 1: Create .env file
        └─ Copy .env.example → .env
        └─ Fill in: MongoDB URI, Gmail username, Gmail app password
        
STEP 2: Test credentials (run test-setup)
        └─ npm run test-setup
        └─ Should see: "✓ Email SMTP Connection verified"
        
STEP 3: Initialize database (run init-db)
        └─ npm run init-db
        └─ Should see: "✅ All collections created"
        
STEP 4: Verify everything (run test-setup again)
        └─ npm run test-setup
        └─ Should see: "✅ All tests passed"
        
STEP 5: Start the app
        └─ npm run dev     (development mode)
        └─ OR npm start    (production mode)
```

---

## 📋 What Each Script Does (Detailed)

### init-db.js (Database Setup - Run Once)

**Purpose:** Creates the database structure

**Creates these collections:**
- `users` - User accounts
- `otps` - One-time passwords for login
- `work_experience` - User job history
- `target_colleges` - Preferred colleges
- `gd_topics` - Discussion topics
- `interview_experiences` - Interview stories

**Run it:**
```bash
npm run init-db
```

**Output example:**
```
🚀 Starting MongoDB Collection Initialization...

✓ Collection 'users' created successfully with indexes
✓ Collection 'otps' created successfully with indexes
✓ Collection 'work_experience' created successfully with indexes
...

✅ All collections and indexes created successfully!
```

---

### test-setup.js (Setup Verification - Run Often)

**Purpose:** Test that your setup is working

**Tests:**
1. ✅ Environment variables in `.env`
2. ✅ MongoDB connection
3. ✅ Collections exist
4. ✅ Gmail SMTP connection
5. ✅ Send TEST EMAIL to sarpit4545@gmail.com
6. ✅ System versions

**Run it:**
```bash
npm run test-setup
```

**Output example:**
```
╔════════════════════════════════════════════════════════╗
║  🚀 MBA Portal - Setup Test Script                    ║
╚════════════════════════════════════════════════════════╝

📋 TEST 1: Environment Variables
✓ MONGODB_URI: mongodb+srv://...
✓ EMAIL_USER: your-email@gmail.com
...

🗄️  TEST 2: Database Connection
✓ Successfully connected to MongoDB

📧 TEST 4: Email SMTP Connection
✓ SMTP credentials verified

✉️  TEST 5: Sending Test Email
✓ Test email sent to: sarpit4545@gmail.com

📊 TEST SUMMARY
✓ Passed: 28
✗ Failed: 0
✅ All tests passed!
```

---

## 🎯 When to Run Each Script

| Situation | Command | Why |
|-----------|---------|-----|
| First time setup | `npm run init-db` | Create database structure |
| Testing setup | `npm run test-setup` | Verify credentials work |
| Before every dev session | `npm run test-setup` | Catch issues early |
| Troubleshooting DB | `npm run test-setup` | See if DB connection works |
| Troubleshooting email | `npm run test-setup` | See if email works |

---

## 🆘 Troubleshooting Quick Links

**Problem:** init-db fails
→ Run `npm run test-setup` first to fix issues

**Problem:** test-setup fails on email
→ Check Gmail app password in `.env`

**Problem:** test-setup fails on database
→ Check MongoDB URI in `.env`

**Problem:** Email not arriving
→ Check spam folder, or run `npm run test-setup` again

---

## ✨ That's it!

Once both scripts run successfully:
1. Your database is set up ✅
2. Your email is configured ✅
3. Everything is tested ✅
4. You're ready to start the app! ✅

```bash
npm run dev
```

Visit: **http://localhost:3000**

