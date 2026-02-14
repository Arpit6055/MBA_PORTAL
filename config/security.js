/**
 * 🔒 SECURITY MIDDLEWARE
 * 
 * All security measures for Express application
 * Apply these in app.js before defining routes
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const validator = require('validator');
const crypto = require('crypto');
const logger = require('./logger');  // Assuming you have a logger

// ============================================================
// 1. INPUT VALIDATION & SANITIZATION
// ============================================================

/**
 * Sanitize string inputs to prevent NoSQL injection
 * @param {string} input - User input
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  // Remove dangerous characters
  return input
    .trim()
    .replace(/[{}\[\],$;:<>'"`\\]/g, '')
    .substring(0, 500);  // Limit length
};

/**
 * Escape HTML to prevent XSS
 * @param {string} unsafe - Unescaped HTML
 * @returns {string} Escaped HTML
 */
const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  return validator.isEmail(email) && email.length <= 254;
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - MongoDB ObjectId
 * @returns {boolean}
 */
const isValidMongoId = (id) => {
  return /^[0-9a-f]{24}$/.test(id?.toLowerCase() || '');
};

/**
 * Validate strong password
 * Min 8 chars, 1 uppercase, 1 number, 1 special char
 * @param {string} password
 * @returns {boolean}
 */
const isValidPassword = (password) => {
  const rules = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  ];
  return rules.every(Boolean);
};

/**
 * Parse and validate JSON safely
 * @param {string} jsonString
 * @returns {object|null}
 */
const safeJsonParse = (jsonString) => {
  try {
    if (typeof jsonString !== 'string') return null;
    const limit = 1024 * 1024;  // 1MB max
    if (jsonString.length > limit) return null;
    return JSON.parse(jsonString);
  } catch (error) {
    logger.warn('Invalid JSON provided', { error: error.message });
    return null;
  }
};

// ============================================================
// 2. SECURITY HEADERS & HELMET
// ============================================================

const getHelmetConfig = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  });
};

// ============================================================
// 3. RATE LIMITING
// ============================================================

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.role === 'admin'
});

/**
 * Strict rate limiter for authentication
 * 5 requests per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
  skip: (req) => req.user?.role === 'admin'
});

/**
 * Strict rate limiter for password reset
 * 3 requests per hour
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again later.'
});

/**
 * Public content rate limiter
 * 50 requests per minute (generous for public browsing)
 */
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  skip: (req) => req.user?.role === 'admin'
});

// ============================================================
// 4. MIDDLEWARE CONFIGURATION
// ============================================================

/**
 * Apply all security middleware to Express app
 * @param {object} app - Express application
 */
const applySecurityMiddleware = (app) => {
  // Security headers
  app.use(getHelmetConfig());
  
  // Data sanitization
  app.use(mongoSanitize());  // Prevents NoSQL injection
  app.use(hpp());            // Prevents HTTP Parameter Pollution
  
  // CORS (configure based on your needs)
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
  const cors = require('cors');
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600
  }));
  
  // Request size limits
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));
  
  // Rate limiting - Apply to public API
  app.use('/api/', apiLimiter);
  
  // Specific strict limits
  app.use('/login', authLimiter);
  app.use('/register', authLimiter);
  app.use('/forgot-password', passwordResetLimiter);
};

// ============================================================
// 5. AUTHENTICATION HELPERS
// ============================================================

const bcrypt = require('bcrypt');

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
  return await bcrypt.hash(password, rounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// ============================================================
// 6. ENCRYPTION HELPERS
// ============================================================

/**
 * Encrypt sensitive data at rest
 * @param {any} data - Data to encrypt
 * @param {string} key - Encryption key (32 hex chars)
 * @returns {string} Encrypted data (iv:encrypted)
 */
const encryptData = (data, key = process.env.ENCRYPTION_KEY) => {
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

/**
 * Decrypt sensitive data
 * @param {string} encrypted - Encrypted data string (iv:encrypted)
 * @param {string} key - Encryption key (32 hex chars)
 * @returns {any} Decrypted data
 */
const decryptData = (encrypted, key = process.env.ENCRYPTION_KEY) => {
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

// ============================================================
// 7. LOGGING HELPERS
// ============================================================

/**
 * Redact sensitive fields from logs
 * @param {object} obj - Object to redact
 * @returns {object} Redacted copy
 */
const sanitizeForLogging = (obj) => {
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn', 'phone', 'email'];
  const copy = JSON.parse(JSON.stringify(obj));
  
  const redactRecursive = (target) => {
    for (let key in target) {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
        target[key] = '[REDACTED]';
      } else if (typeof target[key] === 'object' && target[key] !== null) {
        redactRecursive(target[key]);
      }
    }
  };
  
  redactRecursive(copy);
  return copy;
};

// ============================================================
// 8. AUTHENTICATION MIDDLEWARE
// ============================================================

/**
 * Verify JWT token (if using stateless auth)
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No authorization token' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid JWT token attempt');
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Check user has required role
 * @param {array<string>} requiredRoles - Allowed roles
 * @returns {function} Middleware function
 */
const authorizeRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!requiredRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user._id,
        requiredRole: requiredRoles,
        userRole: req.user.role
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// ============================================================
// 9. ERROR HANDLING
// ============================================================

/**
 * Global error handler - doesn't leak sensitive info
 * @param {object} err - Error object
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?._id,
    ip: req.ip
  });
  
  const responseMessage = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  
  res.status(err.status || 500).json({
    error: responseMessage,
    ...(process.env.NODE_ENV !== 'production' && { details: err.stack })
  });
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Configuration
  applySecurityMiddleware,
  getHelmetConfig,
  
  // Input validation
  sanitizeString,
  escapeHtml,
  isValidEmail,
  isValidMongoId,
  isValidPassword,
  safeJsonParse,
  
  // Rate limiting
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  publicLimiter,
  
  // Password handling
  hashPassword,
  comparePassword,
  
  // Encryption
  encryptData,
  decryptData,
  
  // Logging
  sanitizeForLogging,
  
  // Authentication
  verifyJWT,
  authorizeRole,
  
  // Error handling
  errorHandler
};
