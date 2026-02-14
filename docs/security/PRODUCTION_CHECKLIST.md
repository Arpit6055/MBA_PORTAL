# ✅ PRODUCTION SECURITY CHECKLIST

**Status:** Must be 100% complete before deploying to production

---

## 🔐 CRITICAL (DO FIRST)

- [ ] **Read SECURITY.md** - Complete security guide
  - Location: `docs/security/SECURITY.md`
  - Time: 45 minutes
  - DO NOT SKIP

- [ ] **Create .env file** - Store all secrets
  - Copy: `cp docs/security/.env.example .env`
  - Update: Every value marked with `your-`
  - Add to .gitignore: ✅ Already done
  - Test: `grep "\.env$" .gitignore` should match

- [ ] **Generate Strong Secrets** - Replace placeholders
  ```bash
  # SESSION_SECRET (32+ random chars)
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # JWT_SECRET (32+ random chars)
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # ENCRYPTION_KEY (32 hex chars)
  node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
  ```

- [ ] **Never Commit .env** - Verify setup
  ```bash
  # .env should NOT be tracked
  git status | grep "\.env"  # Should be empty
  
  # Only .env.example should be tracked
  git ls-files | grep "\.env.example"  # Should match
  ```

---

## 🛡️ INPUT VALIDATION

- [ ] **All query parameters validated**
  - Example: `/college?name=xyz` → validate before querying
  - Use: Validators from `config/security.js`
  - Check: `sanitizeString()`, `isValidEmail()`, etc.

- [ ] **All form inputs validated**
  - POST/PUT/PATCH body → validate type, length, format
  - Use: `validator` package (already installed)
  - Test: Try invalid data, should reject

- [ ] **No raw MongoDB queries**
  - ❌ Bad: `db.find({ name: userInput })`
  - ✅ Good: `db.find({ name: sanitizeString(userInput) })`
  - Check: `config/security.js` for helpers

- [ ] **URL parameters validated**
  - Example: `/college/:id` → validate ObjectId
  - Use: `isValidMongoId()` helper
  - Test: Try `/college/invalid`, should 400 error

- [ ] **File uploads secured**
  - Check: File type, size, virus scan if possible
  - Limit: Max 10MB per file (configured in security.js)
  - Store: Outside web root, serve via handler

---

## 🔑 AUTHENTICATION & PASSWORDS

- [ ] **Passwords hashed with bcrypt**
  - Never: Plain text passwords
  - Always: Use `hashPassword()` when saving
  - Verify: User model uses bcrypt with 10+ rounds
  - Check: `BCRYPT_ROUNDS=10` in .env

- [ ] **Session secure configuration**
  ```javascript
  // From config/security.js - already set up
  cookie: {
    httpOnly: true,      // ✅ No JavaScript access
    secure: true,        // ✅ HTTPS only
    sameSite: 'strict'   // ✅ CSRF protection
  }
  ```

- [ ] **JWT tokens properly validated**
  - Signature verified: ✅ (in verifyJWT middleware)
  - Expiration checked: ✅ (in verifyJWT)
  - Secret strong: ✅ (32+ chars in .env)

- [ ] **Password strength enforced**
  - Min 8 characters: ✅
  - Uppercase, number, special char: ✅
  - Use: `isValidPassword()` validator
  - Reject: Weak passwords

- [ ] **Failed login attempts tracked**
  - Max 5 attempts / 15 minutes
  - 3 attempts for password reset
  - Alert admin on multiple failures
  - Auto-lockout after limit

---

## 🔒 DATA PROTECTION

- [ ] **HTTPS enabled in production**
  - ❌ Development: HTTP OK for localhost
  - ✅ Production: HTTPS required
  - Certificate: Valid, not self-signed
  - Config: In .env as SSL_KEY_PATH, SSL_CERT_PATH
  - Test: `curl https://yourdomain.com` (no warnings)

- [ ] **Sensitive data encrypted at rest**
  - SSN, Phone, Credit card → Encrypted
  - Use: `encryptData()` and `decryptData()` from security.js
  - Key: Stored in ENCRYPTION_KEY env var
  - Test: Check database for readable personal data (should be encrypted)

- [ ] **Sensitive fields in logs redacted**
  - Never: Log passwords, tokens, SSN, etc.
  - Use: `sanitizeForLogging()` helper
  - Test: Check logs for sensitive data (should be [REDACTED])

- [ ] **Error messages don't leak info**
  - ❌ Bad: Show stack trace to user
  - ✅ Good: Generic message in production
  - Set: `NODE_ENV=production` in .env
  - Test: Cause error, should NOT see stack trace

- [ ] **Database backups encrypted**
  - Backup location: Secured storage
  - Encryption: Enabled for backups
  - Frequency: Daily
  - Tested: Restore from backup successfully

---

## 🚫 INJECTION & ATTACK PREVENTION

- [ ] **NoSQL Injection prevented**
  - Use: `mongoSanitize()` middleware (already applied in security.js)
  - Test: Try `?name={"$ne": ""}` → Should not work
  - Validate: All user input before DB query

- [ ] **XSS prevented**
  - Use: `escapeHtml()` before rendering
  - Helmet CSP: Configured in security.js ✅
  - Test: Try `<script>alert('xss')</script>` in input → Should not execute

- [ ] **CSRF protected**
  - Token required: For POST/PUT/DELETE
  - Domain-specific: CORS configured ✅
  - Validation: Tokens checked server-side

- [ ] **Parameter Pollution prevented**
  - Use: `hpp()` middleware (already applied) ✅
  - Test: Try duplicate parameters

- [ ] **SQL Injection not applicable**
  - Note: Using MongoDB (NoSQL), not SQL
  - Still: Apply NoSQL injection prevention ✅

---

## 🔐 API SECURITY

- [ ] **Rate limiting enabled**
  - General API: 100 req/15 min
  - Login: 5 attempts/15 min
  - Password reset: 3 attempts/60 min
  - Test: Exceed limit → 429 error

- [ ] **CORS properly configured**
  - Allowed origins: Only your domain(s)
  - Credentials: true (for auth)
  - Methods: Limited (not all)
  - Headers: Specific, not wildcard
  - Test: Try from different domain → Should block

- [ ] **CSRF tokens validated**
  - All forms: Include CSRF token
  - Validation: Server-side check
  - Test: POST without token → Should fail

- [ ] **Security headers set** (Helmet already does this)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security: 1 year
  - CSP: Configured
  - Test: `curl -I http://localhost:3000` (check headers)

- [ ] **API versions controlled**
  - Deprecation: Handled gracefully
  - Breaking changes: Communicated
  - Old versions: Maintained briefly

---

## 💾 DATABASE SECURITY

- [ ] **MongoDB authentication enabled**
  - User created: app_user with password
  - Permissions: readWrite only (not admin)
  - Connection: `mongodb://user:pass@host/db`
  - Test: Try connecting without password → Should fail

- [ ] **Database connection uses SSL/TLS**
  - MongoDB Atlas: ✅ Default encrypted
  - Self-hosted: Configure TLS
  - Connection string: `mongodb+srv://...` (encrypted)

- [ ] **Database user has minimum permissions**
  - ✅ readWrite on app database only
  - ✅ NOT admin or superUser
  - ✅ NOT access to other databases

- [ ] **Database backups configured**
  - Automated: Daily backups
  - Encrypted: TLS/SSL encryption
  - Stored: Secure location (not in repo)
  - Tested: Recovery procedure works

- [ ] **Database indexes optimized**
  - Performance: Indexes on frequent queries
  - Uniqueness: Unique indexes where needed
  - Sparse: For optional fields
  - Check: `db.collection.getIndexes()`

- [ ] **No sensitive data in logs**
  - Queries logged: ✅ Without parameters
  - Errors logged: ✅ Sanitized
  - Test: Check MongoDB logs (no SQL, no data)

---

## 📊 LOGGING & MONITORING

- [ ] **Application errors logged**
  - Framework: Winston (installed)
  - Level: info in prod, debug in dev
  - Format: Structured JSON for parsing
  - Rotation: Daily log rotation
  - Location: `logs/` directory

- [ ] **Failed login attempts monitored**
  - Tracked: Attempts per user/IP
  - Alert: After 5 failures
  - Action: Temporary lockout or CAPTCHA
  - Review: Daily for patterns

- [ ] **API requests logged**
  - Framework: Morgan (express logging)
  - Fields: Method, URL, Status, Response time
  - Excluded: Health checks, excessive detail
  - Format: One line per request

- [ ] **Sensitive data never logged**
  - Passwords: 🚫 Never
  - Tokens: 🚫 Never
  - SSN/Cards: 🚫 Never
  - Use: `sanitizeForLogging()` helper

- [ ] **Logs stored securely**
  - Location: Secured filesystem
  - Rotation: Automatic (weekly or 50MB)
  - Retention: 30 days minimum
  - Archived: Secure storage after rotation

- [ ] **Database query performance monitored**
  - Slow queries: Logged with threshold
  - Indexes: Checked for missing ones
  - Connections: Monitored for leaks

- [ ] **Server resources monitored**
  - CPU: Alert if >80%
  - Memory: Alert if >85%
  - Disk: Alert if >90%
  - Response times: <500ms target

---

## 📦 DEPENDENCY MANAGEMENT

- [ ] **npm audit passed**
  ```bash
  npm audit
  # Should show: 0 critical, 0 high vulnerabilities
  ```

- [ ] **All dependencies updated**
  ```bash
  npm outdated  # Check for updates
  npm update    # Safe updates
  npm audit fix # Fix vulnerable ones
  ```

- [ ] **package-lock.json committed**
  - Ensures: Exact versions installed
  - Use: `npm ci` in production (not `npm install`)

- [ ] **No development packages in production**
  - ✗ nodemon: Only in devDependencies ✅
  - ✗ mocha, jest: Only in devDependencies ✅
  - Check: package.json properly structured ✅

- [ ] **Dangerous packages avoided**
  - ❌ eval() calls
  - ❌ process.env directly without validation
  - ❌ fs commands from user input
  - Check: `npm ls | grep <dangerous_package>`

---

## 🔧 CONFIGURATION

- [ ] **Environment variables correct**
  - Development: localhost, test DB
  - Production: Real domain, real DB
  - Different: Each environment has own .env
  - Verified: Test after each deploy

- [ ] **NODE_ENV set correctly**
  - Development: `NODE_ENV=development`
  - Production: `NODE_ENV=production`
  - Never: `NODE_ENV=test` in production
  - Enable: Different error handling per env

- [ ] **Secrets never in code**
  - ❌ Hardcoded passwords: None found
  - ❌ API keys in code: None found
  - ✅ All secrets: In .env file
  - Reason: Prevents accidental commits

- [ ] **External service credentials secure**
  - Email passwords: In .env ✅
  - API keys: In .env ✅
  - Database passwords: In .env ✅
  - Rotation: Every 90 days

---

## 🧪 TESTING & VALIDATION

- [ ] **Test SQL/NoSQL injection attempts**
  ```bash
  curl 'http://localhost:3000/api/colleges?name={"$ne":""}'
  # Should return generic error, not execute query
  ```

- [ ] **Test XSS attempts**
  - Input: `<script>alert('xss')</script>`
  - Result: Rendered as text, not executed
  - Check: Page source shows escaped HTML

- [ ] **Test CSRF protection**
  - POST without token: 403 Forbidden
  - POST with bad token: 403 Forbidden
  - POST with good token: 200 OK

- [ ] **Test rate limiting**
  ```bash
  for i in {1..150}; do curl http://localhost:3000; done
  # Should get 429 after 100 requests
  ```

- [ ] **Test authentication**
  - No token: 401 Unauthorized
  - Invalid token: 401 Unauthorized
  - Expired token: 401 Unauthorized
  - Valid token: 200 OK

- [ ] **Test authorization**
  - Wrong role: 403 Forbidden
  - Right role: 200 OK
  - Admin-only endpoint: Non-admin gets 403

- [ ] **Test error handling**
  - Database down: Generic error, not stack trace
  - Invalid input: 400 Bad Request
  - Not found: 404 Not Found
  - Server error: 500, no sensitive data

---

## 🚀 DEPLOYMENT

- [ ] **Pre-deployment backup**
  ```bash
  # Database backup
  mongodump --uri "mongodb://host/dbname" --archive=backup.archive
  
  # Current code
  git tag -a v1.0.0 -m "Production deployment"
  ```

- [ ] **Staging test complete**
  - Deployed: To staging environment
  - Tested: All features in staging
  - Verified: Security measures working
  - Passed: All security checks above

- [ ] **Rollback plan ready**
  - Previous version: Tagged in git
  - Database rollback: Procedure documented
  - Time estimate: <5 minutes
  - Tested: Rollback process works

- [ ] **Monitoring alerts configured**
  - Error rate: Alert if >1%
  - Response time: Alert if >1000ms
  - Server resources: Alert if thresholds exceeded
  - Failed logins: Alert admin

- [ ] **Post-deployment verification**
  - API endpoint tests: All passing
  - Database connection: Working
  - Security headers: Present
  - Rate limiting: Enforced
  - Logging: Recording events

- [ ] **Team notified**
  - Stakeholders: Deployment completed
  - Developers: New environment details
  - Ops: Monitoring configured
  - Support: New environment info

---

## 📋 FINAL CHECKS

- [ ] `.env` file created and protected
- [ ] All secrets generated and strong
- [ ] Security packages installed: npm install ✅
- [ ] security.js middleware applied in app.js
- [ ] Database with authentication
- [ ] HTTPS certificate valid
- [ ] Rate limiting working
- [ ] CORS configured
- [ ] Error messages safe
- [ ] Logs clean (no sensitive data)
- [ ] npm audit passes
- [ ] All tests passing
- [ ] Code review completed
- [ ] Staging deployment successful
- [ ] Monitoring configured
- [ ] Rollback plan ready
- [ ] Team trained

---

## 🎯 SIGN OFF

**MUST complete all checks before production deployment**

| Item | Status | Owner | Date |
|------|--------|-------|------|
| Security review | ⚪ Pending | _____ | ____ |
| All checklist items | ⚪ Pending | _____ | ____ |
| Staging deployment passed | ⚪ Pending | _____ | ____ |
| Final approval | ⚪ Pending | _____ | ____ |

---

**Version:** 1.0  
**Last Updated:** February 14, 2026  
**Scope:** Production Deployment Checklist
