/**
 * Main Express Application
 * MBA Aspirant Prep Portal
 */

const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ======================
// MIDDLEWARE SETUP
// ======================

// CORS
app.use(cors());

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration
app.use(
  session({
    secret: process.env.SECRET_KEY || 'mba_portal_secret_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true,
      sameSite: 'Lax', // Allow credentials in cross-site requests
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ======================
// VIEW ENGINE SETUP (PUG)
// ======================

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ======================
// GLOBAL MIDDLEWARE
// ======================

// Add user info to all views
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? { id: req.session.userId, email: req.session.email } : null;
  res.locals.isAuthenticated = !!req.session.userId;
  next();
});

// ======================
// ROUTES
// ======================

// Import route files
const authRoutes = require('./routes/authRoutes');

// Register routes
app.use('/api/auth', authRoutes);

// Home page
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('index', { title: 'MBA Aspirant Portal' });
});

// Login page
app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'Login - MBA Portal' });
});

// Dashboard (Protected)
app.get('/dashboard', (req, res) => {
  console.log('Dashboard access - Session userId:', req.session.userId);
  if (!req.session.userId) {
    console.log('✗ Redirecting to login - No session');
    return res.redirect('/login');
  }
  console.log('✓ Dashboard access granted for:', req.session.email);
  res.render('dashboard', { title: 'Dashboard - MBA Portal' });
});

// Profile page (Protected)
app.get('/profile', (req, res) => {
  console.log('Profile access - Session userId:', req.session.userId);
  if (!req.session.userId) {
    console.log('✗ Redirecting to login - No session');
    return res.redirect('/login');
  }
  res.render('profile', { title: 'My Profile - MBA Portal' });
});

// Complete Profile page (for new users)
app.get('/complete-profile', (req, res) => {
  console.log('Complete-profile access - Session userId:', req.session.userId);
  if (!req.session.userId) {
    console.log('✗ Redirecting to login - No session');
    return res.redirect('/login');
  }
  res.render('complete-profile', { title: 'Complete Your Profile - MBA Portal' });
});

// GD/PI War Room
app.get('/gd-war-room', (req, res) => {
  res.render('gd-war-room', { title: 'GD/PI War Room - MBA Portal' });
});

// Interview Experiences
app.get('/experiences', (req, res) => {
  res.render('experiences', { title: 'Interview Experiences - MBA Portal' });
});

// ROI Calculator
app.get('/roi-calculator', (req, res) => {
  res.render('roi-calculator', { title: 'ROI Calculator - MBA Portal' });
});

// ======================
// ERROR HANDLING
// ======================

// 404 Error Handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', {
    title: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// ======================
// START SERVER
// ======================

const db = require('./config/db');
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to MongoDB
    await db.connect();

    // Initialize collections if missing
    console.log('\n📊 Checking/Creating collections...\n');
    
    const collections = [
      { name: 'users', indexes: { email: { unique: true }, created_at: {} } },
      { name: 'otps', indexes: { email: {}, expires_at: {} } },
      { name: 'work_experience', indexes: { email: {}, created_at: {} } },
      { name: 'target_colleges', indexes: { email: {} } },
      { name: 'gd_topics', indexes: { category: {}, created_at: {} } },
      { name: 'interview_experiences', indexes: { email: {}, college_name: {}, created_at: {} } },
      { name: 'roi_calculations', indexes: { email: {}, created_at: {} } },
      { name: 'sessions', indexes: { expire: {} } },
    ];

    for (const collection of collections) {
      await db.createCollection(collection.name, collection.indexes);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║     🎓 MBA Aspirant Portal - Server Started            ║
╠════════════════════════════════════════════════════════╣
║ Server Running on: http://localhost:${PORT}
║ Environment: ${process.env.NODE_ENV || 'development'}
║ Database: MongoDB (${process.env.DB_NAME || 'mba_portal'})
║ Status: ✓ Connected & Initialized
╚════════════════════════════════════════════════════════╝
      `);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await db.close();
  process.exit(0);
});

module.exports = app;
