# 📋 SETUP CHECKLIST - SECURITY & ENVIRONMENT

**Do this FIRST before running your application**

---

## ✅ STEP 1: Create .env File

1. **Copy the example file:**
   ```bash
   cp docs/security/.env.example .env
   ```

2. **Edit .env with actual values:**
   ```bash
   # On Windows (PowerShell)
   notepad .env
   
   # On Mac/Linux
   nano .env
   ```

3. **Replace these with REAL values:**

   | Key | What to Do |
   |-----|-----------|
   | `SESSION_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `ENCRYPTION_KEY` | Generate: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` |
   | `MONGODB_URI` | Your MongoDB connection string |
   | `DB_NAME` | Your database name |
   | `SMTP_USER` | Your email address |
   | `SMTP_PASSWORD` | Your app-specific email password |
   | `ADMIN_PASSWORD` | Change to a strong password |

4. **Verify .env is in .gitignore:**
   ```bash
   # Should see .env in the list
   grep "^\.env$" .gitignore
   ```

---

## ✅ STEP 2: Verify Security Files

These files should exist:

- ✅ `.env` (local, in .gitignore)
- ✅ `.gitignore` (in root, tracks secrets)
- ✅ `docs/security/SECURITY.md` (guidelines)
- ✅ `docs/security/.env.example` (template)
- ✅ `config/security.js` (middleware)

**Check:**
```bash
ls -la .env .gitignore
ls -la docs/security/
ls -la config/security.js
```

---

## ✅ STEP 3: Install Security Packages

```bash
npm install
```

Should install:
- `helmet` - Security headers
- `bcrypt` - Password hashing
- `express-rate-limit` - Rate limiting
- `express-mongo-sanitize` - NoSQL injection prevention
- `validator` - Input validation
- `jsonwebtoken` - JWT auth
- `hpp` - Parameter pollution protection
- `cookie-parser` - Cookie handling
- `winston` - Secure logging

---

## ✅ STEP 4: Update app.js

Add to the TOP of your app.js (before any routes):

```javascript
require('dotenv').config();
const { applySecurityMiddleware } = require('./config/security');

const express = require('express');
const app = express();

// Apply ALL security middleware IMMEDIATELY
applySecurityMiddleware(app);

// Then add your routes...
// app.use('/api', apiRoutes);
// app.use('/', webRoutes);
```

---

## ✅ STEP 5: Verify MongoDB Connection

Make sure your MongoDB connection uses authentication:

```javascript
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI;
// Should look like:
// mongodb://username:password@localhost:27017/mba_portal
// OR
// mongodb+srv://username:password@cluster.mongodb.net/mba_portal

const client = new MongoClient(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin'
});
```

---

## ✅ STEP 6: Test Security

```bash
# Start server
npm start

# In another terminal, test rate limiting
for i in {1..10}; do curl http://localhost:3000/api/colleges; done
# Should get: 429 Too Many Requests after limiting

# Test CORS
curl -H "Origin: http://evil.com" http://localhost:3000
# Should be blocked if not in ALLOWED_ORIGINS

# Check security headers
curl -i http://localhost:3000
# Should see: X-Frame-Options, X-Content-Type-Options, etc.
```

---

## ✅ STEP 7: Don't Forget These

**CRITICAL - NEVER DO THIS:**

| ❌ DON'T | ✅ DO |
|---------|------|
| Commit .env to git | Use .env.example, add .env to .gitignore |
| Hardcode secrets | Store in environment variables |
| Log passwords | Use sanitizeForLogging() |
| JavaScript password validation only | Hash on server with bcrypt |
| Trust user input | Always validate/sanitize |
| HTTP in production | Use HTTPS with valid cert |
| No rate limiting | Use express-rate-limit |
| Direct MongoDB queries | Use parameterized queries |

---

## 🔐 Security Checklist by Environment

### Development (localhost)
- ✅ .env file created with dummy values
- ✅ Security packages installed
- ✅ app.js imports security.js
- ✅ applySecurityMiddleware() called
- ✅ MongoDB running locally (no auth needed for testing)

### Staging
- ✅ Real passwords in .env
- ✅ MongoDB with authentication enabled
- ✅ HTTPS certificate installed
- ✅ Rate limiting configured
- ✅ Logging enabled
- ✅ Admin panel secured

### Production (CRITICAL)
- ✅ Strong SESSION_SECRET (32+ random chars)
- ✅ Strong JWT_SECRET (32+ random chars)
- ✅ Strong ENCRYPTION_KEY (32 hex chars)
- ✅ MongoDB Atlas with authentication (never localhost)
- ✅ HTTPS with valid certificate
- ✅ All .env secrets from secure secret manager
- ✅ Rate limiting: 100 requests/15min for API
- ✅ Rate limiting: 5 attempts/15min for login
- ✅ CORS limited to your domain only
- ✅ Error responses don't show stack traces
- ✅ Logging doesn't capture sensitive data
- ✅ Database backups enabled
- ✅ Monitoring and alerts configured
- ✅ npm audit run and vulnerabilities fixed

---

## 📚 Documentation

For detailed security info, see:
- `docs/security/SECURITY.md` - Complete security guide
- `config/security.js` - All security functions with examples

---

## 🆘 TROUBLESHOOTING

**Problem: "Cannot find module 'helmet'"**
```bash
npm install
npm install --save helmet
```

**Problem: ".env not being loaded"**
```javascript
// Make sure this is at the TOP of app.js, before anything else
require('dotenv').config();
console.log('NODE_ENV:', process.env.NODE_ENV);
```

**Problem: "Session secret looks like placeholder"**
- Did you update .env with real values?
- Check: `cat .env | grep SESSION_SECRET`

**Problem: "Rate limiting blocking legitimate users"**
- Increase limit in QUICK_START.md
- Or create whitelist for certain IPs

---

## ✨ YOU'RE DONE!

Verify everything works:
```bash
npm install
npm start
curl http://localhost:3000
# Should see: no errors, security headers present
```

**Next:** Read [QUICK_START.md](../QUICK_START.md) for daily development
