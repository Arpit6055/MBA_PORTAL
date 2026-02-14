#!/usr/bin/env node

/**
 * Comprehensive Setup Test Script
 * Tests: Database Connection, Email Configuration, Environment Variables
 * Run: node scripts/test-setup.js
 */

require('dotenv').config();
const db = require('../config/db');
const nodemailer = require('nodemailer');

const TEST_EMAIL = 'sarpit4545@gmail.com';
let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

// ✅ Test 1: Check Environment Variables
async function testEnvironmentVariables() {
  console.log('\n📋 TEST 1: Environment Variables\n');
  
  const requiredVars = [
    'MONGODB_URI',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'SMTP_HOST',
    'SMTP_PORT',
    'NODE_ENV',
    'PORT',
  ];

  let allPresent = true;
  requiredVars.forEach((envVar) => {
    if (process.env[envVar]) {
      console.log(`✓ ${envVar}: ${envVar === 'EMAIL_PASSWORD' ? '****' : process.env[envVar]}`);
      testResults.passed++;
    } else {
      console.log(`✗ ${envVar}: MISSING`);
      testResults.failed++;
      testResults.errors.push(`Missing environment variable: ${envVar}`);
      allPresent = false;
    }
  });

  return allPresent;
}

// ✅ Test 2: Database Connection
async function testDatabaseConnection() {
  console.log('\n🗄️  TEST 2: Database Connection\n');
  
  try {
    await db.connect();
    console.log('✓ Successfully connected to MongoDB');
    testResults.passed++;
    return true;
  } catch (error) {
    console.log('✗ Database connection failed');
    console.log(`  Error: ${error.message}`);
    testResults.failed++;
    testResults.errors.push(`DB Connection: ${error.message}`);
    return false;
  }
}

// ✅ Test 3: Check MongoDB Collections
async function testCollections() {
  console.log('\n📦 TEST 3: MongoDB Collections\n');
  
  try {
    const database = db.getDB();
    const collections = await database.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (collectionNames.length > 0) {
      console.log(`✓ Found ${collectionNames.length} collections:`);
      collectionNames.forEach((name) => {
        console.log(`  • ${name}`);
      });
      testResults.passed++;
      return true;
    } else {
      console.log('⚠️  No collections found (this is okay on first run)');
      console.log('   Run: node scripts/init-db.js');
      testResults.passed++;
      return true;
    }
  } catch (error) {
    console.log('✗ Error checking collections');
    console.log(`  Error: ${error.message}`);
    testResults.failed++;
    testResults.errors.push(`Collections check: ${error.message}`);
    return false;
  }
}

// ✅ Test 4: Email SMTP Connection
async function testEmailConnection() {
  console.log('\n📧 TEST 4: Email SMTP Connection\n');
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.verify();
    console.log('✓ SMTP credentials verified');
    console.log(`  From: ${process.env.EMAIL_USER}`);
    console.log(`  Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    testResults.passed++;
    return transporter;
  } catch (error) {
    console.log('✗ Email configuration failed');
    console.log(`  Error: ${error.message}`);
    testResults.failed++;
    testResults.errors.push(`Email config: ${error.message}`);
    return null;
  }
}

// ✅ Test 5: Send Test Email
async function sendTestEmail(transporter) {
  console.log('\n✉️  TEST 5: Sending Test Email\n');
  
  if (!transporter) {
    console.log('⚠️  Skipped (SMTP not configured)');
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: TEST_EMAIL,
      subject: 'MBA Portal - Setup Test Email',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #667eea;">✓ MBA Portal Setup Successful!</h2>
            <p>This is a test email from your MBA Aspirant Portal application.</p>
            <hr>
            <h3>System Information:</h3>
            <ul>
              <li><strong>Node Environment:</strong> ${process.env.NODE_ENV}</li>
              <li><strong>Port:</strong> ${process.env.PORT}</li>
              <li><strong>Database:</strong> MongoDB Atlas</li>
              <li><strong>Email Service:</strong> Gmail SMTP</li>
            </ul>
            <hr>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p style="color: #999; font-size: 12px;">
              If you received this email, your setup is complete and working correctly!
            </p>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Test email sent to: ${TEST_EMAIL}`);
    console.log('  Check your inbox (may be in spam folder)');
    testResults.passed++;
  } catch (error) {
    console.log('✗ Failed to send test email');
    console.log(`  Error: ${error.message}`);
    testResults.failed++;
    testResults.errors.push(`Send email: ${error.message}`);
  }
}

// ✅ Test 6: Check Node.js and npm versions
async function testVersions() {
  console.log('\n⚙️  TEST 6: System Versions\n');
  
  try {
    const nodeVersion = process.version;
    const fs = require('fs');
    const packageJson = JSON.parse(
      fs.readFileSync('./package.json', 'utf-8')
    );

    console.log(`✓ Node.js: ${nodeVersion}`);
    console.log(`✓ App Version: ${packageJson.version || 'not specified'}`);
    console.log(`✓ App Name: ${packageJson.name || 'not specified'}`);
    testResults.passed++;
  } catch (error) {
    console.log('✗ Error checking versions');
    testResults.failed++;
  }
}

// ✅ Summary Report
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);

  if (testResults.errors.length > 0) {
    console.log('\n❌ Issues found:');
    testResults.errors.forEach((error) => {
      console.log(`  • ${error}`);
    });
  } else {
    console.log('\n✅ All tests passed! Your setup is ready.');
  }

  console.log('='.repeat(60) + '\n');
}

// ✅ Main Test Runner
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  🚀 MBA Portal - Setup Test Script                    ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Test 1: Environment Variables
    const envOk = await testEnvironmentVariables();
    if (!envOk) {
      console.log('\n⚠️  Fix missing environment variables first!');
      console.log('   Copy .env.example to .env and fill in values.\n');
      process.exit(1);
    }

    // Test 2: Database Connection
    const dbOk = await testDatabaseConnection();

    // Test 3: Collections (if DB connected)
    if (dbOk) {
      await testCollections();
    }

    // Test 4: Email Connection
    const transporter = await testEmailConnection();

    // Test 5: Send Test Email
    if (transporter) {
      await sendTestEmail(transporter);
    }

    // Test 6: System Versions
    await testVersions();

    // Close database connection
    if (dbOk) {
      await db.close();
      console.log('\n✓ Database connection closed');
    }
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    testResults.failed++;
  }

  // Print Summary
  printSummary();

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();
