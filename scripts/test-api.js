#!/usr/bin/env node

/**
 * API Testing Script
 * Tests all API endpoints
 * Run: npm run test-api
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

const endpoints = [
  { method: 'GET', path: '/', name: 'Home page' },
  { method: 'GET', path: '/api/colleges', name: 'Get colleges list' },
];

async function testAllEndpoints() {
  try {
    console.log('🧪 Starting API Tests...\n');
    console.log(`Testing endpoints on ${BASE_URL}\n`);

    let passed = 0;
    let failed = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${BASE_URL}${endpoint.path}`,
          timeout: 5000,
        });

        console.log(`✓ [${response.status}] ${endpoint.method} ${endpoint.path} - ${endpoint.name}`);
        passed++;
      } catch (error) {
        console.log(`✗ [${error.response?.status || 'ERR'}] ${endpoint.method} ${endpoint.path} - ${endpoint.name}`);
        if (error.code === 'ECONNREFUSED') {
          console.log('  ⚠️  Server not running. Start with: npm start');
        }
        failed++;
      }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
      console.log('\n✅ All API tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some API tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    process.exit(1);
  }
}

testAllEndpoints();
