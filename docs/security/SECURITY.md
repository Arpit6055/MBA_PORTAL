# 🔒 Security Guidelines & Implementation

**Last Updated:** February 14, 2026  
**Status:** Critical - Must implement before production

---

## TABLE OF CONTENTS

1. [Security Overview](#security-overview)
2. [Input Validation & Injection Prevention](#input-validation--injection-prevention)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Protection & Encryption](#data-protection--encryption)
5. [Environment & Configuration](#environment--configuration)
6. [API Security](#api-security)
7. [Database Security](#database-security)
8. [Logging & Monitoring](#logging--monitoring)
9. [Dependency Management](#dependency-management)
10. [Production Checklist](#production-checklist)

---

## SECURITY OVERVIEW

### Threat Model
Your application faces these primary threats:
- **NoSQL Injection** - Malicious queries to MongoDB
- **XSS (Cross-Site Scripting)** - Malicious scripts in user input
- **CSRF (Cross-Site Request Forgery)** - Unauthorized state changes
- **Data Leaks** - Sensitive data exposed in errors or logs
- **Brute Force** - Password attacks, API abuse
- **Man-in-the-Middle** - Unencrypted data transmission
- **Dependency Vulnerabilities** - Outdated packages with known issues

### Defense Strategy
```
INPUT VALIDATION → SANITIZATION → AUTHENTICATION → AUTHORIZATION → ENCRYPTION
```

---

## INPUT VALIDATION & INJECTION PREVENTION

### 1. NoSQL Injection Prevention

**Problem:**
```javascript
// ❌ DANGEROUS - User input directly in query
db.collection('colleges').find({ name: req.query.name })
// Attacker sends: ?name={"$ne": ""}  → Returns all colleges
```

**Solution:**
```javascript
// ✅ SAFE - Whitelist & validate
const sanitizeString = (input) => {
  if (typeof input !== 'string') throw new Error('Invalid input');
  return input.replace(/[{}\[\]];:,<>'"`\\]/g, '');
};

const collegeName = sanitizeString(req.query.name);
db.collection('colleges').find({ 
  name: new RegExp(`^${collegeName}$`, 'i') 
});
```

### 2. XSS Prevention

**Problem:**
```javascript
// ❌ DANGEROUS - Direct HTML injection
res.render('profile', { 
  bio: req.body.bio  // User enters: <script>alert('hacked')</script>
});
```

**Solution:**
```javascript
// ✅ SAFE - Escape HTML & use Content-Security-Policy
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

res.set('Content-Security-Policy', 
  "default-src 'self'; script-src 'self'"
);
res.render('profile', { bio: escapeHtml(req.body.bio) });
```

### 3. Validation Rules

**Apply everywhere:**
```javascript
const validator = require('validator');

module.exports = {
  validateEmail: (email) => validator.isEmail(email),
  validateUrl: (url) => validator.isURL(url),
  validateInt: (num) => Number.isInteger(Number(num)),
  validateMongoId: (id) => /^[0-9a-f]{24}$/.test(id),
  validateCollegeName: (name) => /^[a-zA-Z0-9\s\-'.()]{1,200}$/.test(name),
  validatePassword: (pwd) => pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd),
};
```

**Where to validate:**
- ✅ Query parameters (?search=...)
- ✅ Form body (POST/PUT data)
- ✅ JSON payloads
- ✅ URL parameters (/college/:id)
- ✅ Headers (custom headers)
- ✅ File uploads

---

## AUTHENTICATION & AUTHORIZATION

### 1. Password Hashing

**Problem:**
```javascript
// ❌ DANGEROUS - Plain text passwords
db.users.updateOne({ email }, { password: req.body.password });
```

**Solution:**
```javascript
const bcrypt = require('bcrypt');

// When registering
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(req.body.password, salt);
db.users.insertOne({ email: req.body.email, password: hashedPassword });

// When logging in
const user = await db.users.findOne({ email: req.body.email });
const isValid = await bcrypt.compare(req.body.password, user.password);
if (!isValid) throw new Error('Invalid password');
```

### 2. Session Security

**Problem:**
```javascript
// ❌ DANGEROUS - Insecure session
req.session.userId = user._id;  // Client can modify
```

**Solution:**
```javascript
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
  secret: process.env.SESSION_SECRET,  // Long random string
  store: new MongoStore({ url: process.env.MONGODB_URI }),
  cookie: {
    httpOnly: true,        // No JavaScript access
    secure: true,          // HTTPS only
    sameSite: 'strict',    // CSRF protection
    maxAge: 1000 * 60 * 60 * 24  // 24 hours
  },
  name: 'app.sid',
  resave: false,
  saveUninitialized: false
}));
```

### 3. JWT Tokens (if using stateless auth)

```javascript
const jwt = require('jsonwebtoken');

// Issue token
const token = jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '24h', algorithm: 'HS256' }
);

// Verify token
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

// Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = verifyJWT(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 4. Role-Based Access Control

```javascript
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage
app.delete('/admin/colleges/:id', 
  authMiddleware, 
  authorizeRole(['admin']),
  deleteCollege
);
```

---

## DATA PROTECTION & ENCRYPTION

### 1. HTTPS Enforcement

**Problem:**
```javascript
// ❌ HTTP allows man-in-the-middle attacks
app.listen(3000);
```

**Solution:**
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

https.createServer(options, app).listen(3000);
// Or redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect(307, `https://${req.get('host')}${req.url}`);
  }
  next();
});
```

### 2. Sensitive Data at Rest

```javascript
const crypto = require('crypto');

const encryptData = (data, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    iv
  );
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), 'utf8'),
    cipher.final()
  ]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decryptData = (encrypted, key) => {
  const [ivHex, encryptedHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    iv
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]);
  return JSON.parse(decrypted.toString('utf8'));
};

// Usage: Store sensitive fields encrypted
const user = {
  email: 'user@example.com',
  phone: encryptData('+91-9999-9999', process.env.ENCRYPTION_KEY)
};
```

### 3. Secrets Management

**Never:**
- ❌ Hardcode secrets in code
- ❌ Commit .env file to git
- ❌ Log passwords or tokens
- ❌ Pass secrets in URLs

**Always:**
- ✅ Store in .env (local development)
- ✅ Use environment variables (production)
- ✅ Rotate keys periodically
- ✅ Use secret management system (AWS Secrets Manager, HashiCorp Vault)

---

## ENVIRONMENT & CONFIGURATION

### 1. .env.example

Keep this in repository (with dummy values):

```
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=mba_portal

# Security
SESSION_SECRET=your-super-secret-session-key-min-32-chars
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef
BCRYPT_ROUNDS=10

# HTTPS (production)
SSL_KEY_PATH=/path/to/private.key
SSL_CERT_PATH=/path/to/certificate.crt

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# API
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### 2. .gitignore

```
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
package-lock.json
yarn.lock

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*

# Production
build/
dist/
.next/

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Testing
coverage/
.nyc_output/

# Temporary
tmp/
temp/
*.tmp

# Secrets
private.key
*.pem
.env.production
```

---

## API SECURITY

### 1. Rate Limiting

**Problem:**
```javascript
// ❌ No limit - Attacker can make 1M requests/second
app.get('/api/colleges', (req, res) => {
  res.json(colleges);
});
```

**Solution:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,      // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,       // Disable `X-RateLimit-*` headers
  skip: (req) => req.user?.role === 'admin'  // Don't rate limit admins
});

app.use('/api/', limiter);

// Stricter limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // Only 5 login attempts per 15 min
  message: 'Too many login attempts, try again later'
});

app.post('/login', authLimiter, loginHandler);
```

### 2. CORS Protection

**Problem:**
```javascript
// ❌ DANGEROUS - Allows any domain
app.use(cors());
```

**Solution:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600  // Preflight cache 10 minutes
}));
```

### 3. CSRF Protection

```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

// For forms
app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

// For POST/PUT/DELETE
app.post('/api/colleges', csrfProtection, (req, res) => {
  // Only processes if valid CSRF token
  res.json({ success: true });
});
```

### 4. Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet());  // Adds multiple security headers

// Additionally:
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

## DATABASE SECURITY

### 1. MongoDB Connection Security

**Problem:**
```javascript
// ❌ No authentication
mongoose.connect('mongodb://localhost:27017');
```

**Solution:**
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin',  // Authentication database
  retryWrites: true,
  w: 'majority'  // Write concern
});
```

### 2. Database User Permissions

```javascript
// MongoDB - Create limited user for your app
db.createUser({
  user: "app_user",
  pwd: "StrongPassword123!",
  roles: [
    { role: "readWrite", db: "mba_portal" }
    // Don't give admin access
  ]
})

// Connection string
mongodb://app_user:StrongPassword123!@localhost:27017/mba_portal?authSource=admin
```

### 3. Query Parameterization

**Always** use parameterized queries:
```javascript
// ✅ GOOD
const result = await db.collection('colleges').findOne({ 
  _id: ObjectId(userId) 
});

// ❌ BAD - Raw string concatenation
const result = await db.collection('colleges').findOne({ 
  _id: ObjectId(userId + someUserInput) 
});
```

### 4. Data Validation in MongoDB

```javascript
// Define schema validation
db.createCollection("colleges", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "tier", "location"],
      properties: {
        name: { bsonType: "string", minLength: 1, maxLength: 200 },
        tier: { enum: [1, 2, 3] },
        location: { bsonType: "string" },
        website: { bsonType: "string", pattern: "^https?://" },
        established: { bsonType: "int", minimum: 1950, maximum: 2025 }
      }
    }
  }
});
```

---

## LOGGING & MONITORING

### 1. Safe Logging

**Problem:**
```javascript
// ❌ DANGEROUS - Logs passwords and tokens
console.log('User login attempt:', req.body);  // Contains password!
logger.info('API Call', { headers: req.headers });  // Contains auth token!
```

**Solution:**
```javascript
const logger = require('winston');

const sanitizeLog = (obj) => {
  const sensitive = ['password', 'token', 'secret', 'apiKey', 'credit_card'];
  const copy = JSON.parse(JSON.stringify(obj));
  
  const redactRecursive = (obj) => {
    for (let key in obj) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redactRecursive(obj[key]);
      }
    }
  };
  
  redactRecursive(copy);
  return copy;
};

// Usage
logger.info('User login:', sanitizeLog(req.body));
logger.error('Database error:', sanitizeLog(error));
```

### 2. Request Logging Middleware

```javascript
const morgan = require('morgan');

// Don't log sensitive fields
morgan.token('user-sanitized', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

app.use(morgan(':method :url :status :response-time ms :user-sanitized'));
```

### 3. Error Handling - Don't Leak Details

**Problem:**
```javascript
// ❌ DANGEROUS - Shows internal stack trace to attacker
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message, stack: err.stack });
});
```

**Solution:**
```javascript
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?._id
  });
  
  // Send generic error to client
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error'
      : err.message
  });
});
```

### 4. Monitoring & Alerts

```javascript
// Monitor failed login attempts
const failedAttempts = new Map();

const trackFailedLogin = (email) => {
  const attempts = (failedAttempts.get(email) || 0) + 1;
  failedAttempts.set(email, attempts);
  
  if (attempts > 5) {
    logger.warn(`⚠️  Multiple failed login attempts for ${email}`);
    // Send alert to admin
    sendAlert(`Potential brute force attack on ${email}`);
  }
  
  // Reset after 24 hours
  setTimeout(() => failedAttempts.delete(email), 24 * 60 * 60 * 1000);
};
```

---

## DEPENDENCY MANAGEMENT

### 1. Keep Dependencies Updated

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Fix with major version updates
npm audit fix --force

# Check outdated packages
npm outdated

# Update safely
npm update
```

### 2. Recommended Security Packages

Add these to `package.json`:
```json
{
  "dependencies": {
    "helmet": "^7.0.0",           // Security headers
    "express-rate-limit": "^7.0.0", // Rate limiting
    "bcrypt": "^5.1.0",            // Password hashing
    "jsonwebtoken": "^9.0.0",      // JWT tokens
    "validator": "^13.9.0",        // Input validation
    "express-mongo-sanitize": "^2.2.0", // NoSQL injection prevention
    "xss-clean": "^0.1.1",        // XSS prevention
    "hpp": "^0.2.3"               // Parameter pollution protection
  }
}
```

### 3. Secure Package Installation

```bash
# Use exact versions (not ^, not ~)
npm install package-name@1.2.3

# Verify package authenticity
npm view package-name

# Lock dependencies
npm ci  # Use package-lock.json instead of package.json

# Scan for vulnerabilities before installing
npm audit before npm install
```

---

## PRODUCTION CHECKLIST

Before deploying to production:

### Environment
- [ ] `NODE_ENV=production`
- [ ] All secrets in `.env` (not in code)
- [ ] SSL/HTTPS certificate installed
- [ ] Database user has minimal required permissions
- [ ] Firewall allows only essential ports (80, 443)

### Application
- [ ] All input validation in place
- [ ] Rate limiting configured
- [ ] CORS restricted to your domain
- [ ] CSRF protection enabled
- [ ] Security headers configured (Helmet)
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't capture passwords/tokens

### Database
- [ ] MongoDB authentication enabled
- [ ] Database backups configured
- [ ] Schema validation rules in place
- [ ] Indexes created for performance and uniqueness

### Monitoring
- [ ] Application error logging enabled
- [ ] Failed login attempts monitored
- [ ] Suspicious activity alerts configured
- [ ] Server resources monitored (CPU, memory)
- [ ] Database query performance monitored

### Dependencies
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review all high/critical vulnerabilities
- [ ] Keep packages updated monthly
- [ ] Use `npm ci` for deployments (not `npm install`)

### Testing
- [ ] Test SQL injection attempts (won't work)
- [ ] Test XSS attempts (won't work)
- [ ] Test CSRF (should fail without token)
- [ ] Test rate limiting (403 after limit)
- [ ] Test with expired JWT (should reject)

### Deployment
- [ ] Backup database before deploying
- [ ] Test on staging environment first
- [ ] Have rollback plan ready
- [ ] Monitor application after deployment
- [ ] Keep audit logs of all changes

---

## QUICK REFERENCE: ADD THESE NOW

### Install Security Packages
```bash
npm install helmet express-rate-limit bcrypt express-mongo-sanitize validator hpp
```

### Create .env File
```bash
cp docs/security/.env.example .env
# Edit .env with your actual secrets
```

### Add to app.js
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Apply security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

---

## RESOURCES

- [OWASP Top 10](https://owasp.org/Top10/) - Security risks
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Secure](https://docs.mongodb.com/manual/security/)

---

**Status: CRITICAL - Implement before production deployment**
