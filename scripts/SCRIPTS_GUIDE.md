# 📋 Setup Scripts Guide

This document explains the different setup and test scripts in the `/scripts` directory.

---

## 🔍 Quick Comparison

| Script | Purpose | When to Run | What It Does |
|--------|---------|------------|--------------|
| **`init-db.js`** | Database Initialization | **Once** on first setup | Creates MongoDB collections & indexes |
| **`test-setup.js`** | Setup Verification | Before and after setup | Tests all configurations working |

---

## 🗄️ init-db.js - Database Initialization

### Purpose
Creates necessary MongoDB collections and sets up database indexes for the first time.

### When to Run
- **Once** during initial project setup
- After this, it's not needed anymore

### What It Creates
Automatically creates these MongoDB collections:
- `users` - Stores user account data
- `otps` - Stores temporary OTP codes
- `work_experience` - Stores user work history
- `target_colleges` - Stores preferred colleges
- `gd_topics` - Stores group discussion topics
- `interview_experiences` - Stores interview stories
- And more...

### Command
```bash
node scripts/init-db.js
```

### Expected Output
```
🚀 Starting MongoDB Collection Initialization...

✓ Collection 'users' created successfully with indexes
✓ Collection 'otps' created successfully with indexes
✓ Collection 'work_experience' created successfully with indexes
...

✅ All collections and indexes created successfully!
```

### Important Notes
- ✅ Safe to run multiple times (skips existing collections)
- ✨ Automatically creates indexes for better performance
- 🔐 Sets up unique constraint on user emails
- ⏰ OTP records auto-expire after 10 minutes (TTL index)

---

## ✅ test-setup.js - Setup Verification

### Purpose
Tests that all your setup is working correctly before running the app.

### When to Run
- After you've created `.env` file with credentials
- Before starting the app for first time
- When troubleshooting connection issues

### What It Tests

#### 1️⃣ Environment Variables
Checks if all required variables are set in `.env`:
- `MONGODB_URI` - MongoDB connection string
- `EMAIL_USER` - Gmail email address
- `EMAIL_PASSWORD` - Gmail app password
- And others...

#### 2️⃣ Database Connection
Verifies you can connect to MongoDB Atlas

#### 3️⃣ MongoDB Collections
Lists existing collections (if init-db.js was run)

#### 4️⃣ Email SMTP Connection
Verifies Gmail credentials are correct

#### 5️⃣ Send Test Email
**Sends a test email to `sarpit4545@gmail.com`** to confirm email service works

#### 6️⃣ System Versions
Shows installed Node.js version and app info

### Command
```bash
node scripts/test-setup.js
```

### Expected Output
```
╔════════════════════════════════════════════════════════╗
║  🚀 MBA Portal - Setup Test Script                    ║
╚════════════════════════════════════════════════════════╝

📋 TEST 1: Environment Variables

✓ MONGODB_URI: mongodb+srv://...
✓ EMAIL_USER: your-email@gmail.com
✓ EMAIL_PASSWORD: ****
...

🗄️  TEST 2: Database Connection

✓ Successfully connected to MongoDB

📦 TEST 3: MongoDB Collections

✓ Found 6 collections:
  • users
  • otps
  • work_experience
  ...

📧 TEST 4: Email SMTP Connection

✓ SMTP credentials verified
  From: your-email@gmail.com
  Host: smtp.gmail.com:587

✉️  TEST 5: Sending Test Email

✓ Test email sent to: sarpit4545@gmail.com
  Check your inbox (may be in spam folder)

⚙️  TEST 6: System Versions

✓ Node.js: v16.13.0
✓ App Version: 1.0.0
✓ App Name: mba-portal

============================================================
📊 TEST SUMMARY
============================================================
✓ Passed: 28
✗ Failed: 0

✅ All tests passed! Your setup is ready.
============================================================
```

---

## 🚀 Complete Setup Checklist

Follow this sequence when setting up for the first time:

```
1. Create .env file with all credentials
   └─ Copy .env.example and fill in values

2. Run test-setup.js to verify credentials
   └─ node scripts/test-setup.js
   └─ Fix any errors here

3. Run init-db.js to create database collections
   └─ node scripts/init-db.js
   └─ Wait for all collections to be created

4. Run test-setup.js again to verify everything
   └─ node scripts/test-setup.js
   └─ Should show all tests passed

5. Start the app
   └─ npm run dev (development mode)
   └─ npm start (production mode)
```

---

## 🐛 Troubleshooting

### "MONGODB_URI is MISSING"
**Problem:** Can't find MongoDB connection string  
**Solution:**
1. Make sure `.env` file exists in project root
2. Add `MONGODB_URI=mongodb+srv://...` to `.env`
3. Get the string from MongoDB Atlas → Connect → Drivers

### "Email configuration failed"
**Problem:** Gmail credentials aren't working  
**Solution:**
1. Check 2-Step Verification is enabled (Settings → Security)
2. Get App Password again from https://myaccount.google.com/apppasswords
3. Copy the 16-character password exactly (with spaces)
4. Update `EMAIL_PASSWORD` in `.env`

### "Database connection failed"
**Problem:** Can't connect to MongoDB Atlas  
**Solution:**
1. Check connection string is correct
2. Verify IP whitelist in MongoDB Atlas (Security → Network Access)
3. Ensure username/password are URL-encoded (@ becomes %40, etc.)

### "No collections found"
**Problem:** init-db.js hasn't been run yet  
**Solution:**
```bash
node scripts/init-db.js
```

---

## 📝 Summary

| File | Purpose | Run Once? | Run Before App Start? |
|------|---------|-----------|----------------------|
| `init-db.js` | Create database structure | 1 time | No, but required once |
| `test-setup.js` | Verify everything works | Multiple times | Yes, before app start |

**Pro Tip:** Keep running `test-setup.js` before development sessions to catch connection issues early!

