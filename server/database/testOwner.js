const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const API_URL = 'http://localhost:5000/api';

async function runOwnerTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE PHASE 7 STORE OWNER TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const timestamp = Date.now();

    // 1. Setup Test Accounts & Stores
    console.log('--- 1. Setting Up Test Store Owner Accounts & Stores ---');
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const ownerAEmail = `owner_a_${timestamp}@example.com`;
    const ownerBEmail = `owner_b_${timestamp}@example.com`;
    const userEmail = `user_rater_${timestamp}@example.com`;

    // Create Owner A
    await db.query('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', [
      'Store Owner A',
      ownerAEmail,
      hashedPassword,
      '100 Owner St',
      'STORE_OWNER',
    ]);
    const ownerALoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerAEmail, password }),
    });
    const ownerALoginJson = await ownerALoginRes.json();
    const ownerAToken = ownerALoginJson.data.token;
    const ownerAId = ownerALoginJson.data.user.id;
    assert(ownerALoginRes.status === 200 && ownerAToken, 'STORE_OWNER A logged in successfully');

    // Create Owner B
    await db.query('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', [
      'Store Owner B',
      ownerBEmail,
      hashedPassword,
      '200 Owner Ave',
      'STORE_OWNER',
    ]);
    const ownerBLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerBEmail, password }),
    });
    const ownerBLoginJson = await ownerBLoginRes.json();
    const ownerBToken = ownerBLoginJson.data.token;
    const ownerBId = ownerBLoginJson.data.user.id;
    assert(ownerBLoginRes.status === 200 && ownerBToken, 'STORE_OWNER B logged in successfully');

    // Create Normal User
    const userSignupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Rater Customer User Account', email: userEmail, address: '300 Rater Rd', password }),
    });
    const userLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password }),
    });
    const userLoginJson = await userLoginRes.json();
    const userToken = userLoginJson.data.token;
    const userId = userLoginJson.data.user.id;
    assert(userToken && userId, 'Created Normal USER for submitting test ratings');

    // Create Admin Token
    const adminEmail = `admin_phase7_${timestamp}@example.com`;
    await db.query('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', [
      'Admin Phase7',
      adminEmail,
      hashedPassword,
      '400 Admin Sq',
      'ADMIN',
    ]);
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    const adminLoginJson = await adminLoginRes.json();
    const adminToken = adminLoginJson.data.token;
    assert(adminToken, 'Created ADMIN token');

    // Create Store A1 (Owned by Owner A)
    const storeA1Insert = await db.query('INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', [
      `Owner A Store 1 ${timestamp}`,
      `storea1_${timestamp}@example.com`,
      '111 Store A1 Blvd',
      ownerAId,
    ]);
    const storeA1Id = storeA1Insert.insertId;

    // Create Store A2 (Second Store Owned by Owner A - Multiple Store Test)
    const storeA2Insert = await db.query('INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', [
      `Owner A Store 2 ${timestamp}`,
      `storea2_${timestamp}@example.com`,
      '222 Store A2 Blvd',
      ownerAId,
    ]);
    const storeA2Id = storeA2Insert.insertId;

    // Create Store B (Owned by Owner B)
    const storeBInsert = await db.query('INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', [
      `Owner B Store ${timestamp}`,
      `storeb_${timestamp}@example.com`,
      '333 Store B Blvd',
      ownerBId,
    ]);
    const storeBId = storeBInsert.insertId;

    assert(storeA1Id && storeA2Id && storeBId, 'Created Store A1, Store A2, and Store B in MySQL');

    // Add Ratings: User rates Store A1 with 4 stars, Store A1 with 5 stars (from second user)
    const user2Email = `user2_rater_${timestamp}@example.com`;
    await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Priya Customer User Account', email: user2Email, address: '500 Customer Way', password }),
    });
    const user2LoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user2Email, password }),
    });
    const user2Token = (await user2LoginRes.json()).data.token;

    // Submit rating for Store A1 by User 1 (4 stars)
    await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ storeId: storeA1Id, rating: 4 }),
    });

    // Submit rating for Store A1 by User 2 (5 stars)
    await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user2Token}` },
      body: JSON.stringify({ storeId: storeA1Id, rating: 5 }),
    });

    // Store A1 Average rating: (4 + 5) / 2 = 4.50

    // 2. Testing Store Owner Dashboard API (GET /api/owner/dashboard)
    console.log('\n--- 2. Testing Store Owner Dashboard API (GET /api/owner/dashboard) ---');
    const dashARes = await fetch(`${API_URL}/owner/dashboard`, {
      headers: { Authorization: `Bearer ${ownerAToken}` },
    });
    const dashAJson = await dashARes.json();
    assert(dashARes.status === 200, 'GET /api/owner/dashboard returns 200 OK for Owner A');
    assert(Array.isArray(dashAJson.data), 'Dashboard data is an array of owned stores');
    assert(dashAJson.data.length === 2, 'Owner A retrieves both owned stores (Multiple stores test passed)');

    const storeA1Data = dashAJson.data.find((s) => (s.storeId || s.id) === storeA1Id);
    assert(storeA1Data && storeA1Data.averageRating === 4.5, 'Store A1 dynamic averageRating correctly calculated: 4.50');
    assert(storeA1Data && storeA1Data.totalRatings === 2, 'Store A1 totalRatings count correctly returned: 2');

    const storeA2Data = dashAJson.data.find((s) => (s.storeId || s.id) === storeA2Id);
    assert(storeA2Data && storeA2Data.averageRating === null, 'Store A2 with no ratings returns averageRating = null');

    // 3. Testing Store Rating Users Listing (GET /api/owner/stores/:storeId/ratings)
    console.log('\n--- 3. Testing Store Rating Users Listing (GET /api/owner/stores/:storeId/ratings) ---');
    const ratingsRes = await fetch(`${API_URL}/owner/stores/${storeA1Id}/ratings`, {
      headers: { Authorization: `Bearer ${ownerAToken}` },
    });
    const ratingsJson = await ratingsRes.json();
    assert(ratingsRes.status === 200, 'GET /api/owner/stores/:storeId/ratings returns 200 OK');
    const ratingUsers = ratingsJson.data;
    assert(Array.isArray(ratingUsers) && ratingUsers.length === 2, 'Returns list of 2 users who rated Store A1');
    assert(ratingUsers[0].name && ratingUsers[0].email && ratingUsers[0].address && ratingUsers[0].rating, 'Returned user object contains name, email, address, and rating');
    assert(!ratingUsers[0].password && !ratingUsers[0].password_hash, 'Password and hash are NOT exposed in response');

    // 4. Testing Ownership Security Enforcement (Cross-Owner Access Rejection)
    console.log('\n--- 4. Testing Ownership Security Enforcement (Cross-Owner Access Rejection) ---');
    // Owner A attempting to access Store B (owned by Owner B)
    const crossAccessRes1 = await fetch(`${API_URL}/owner/stores/${storeBId}/ratings`, {
      headers: { Authorization: `Bearer ${ownerAToken}` },
    });
    assert(crossAccessRes1.status === 403, 'Owner A attempting to access Store B ratings rejected with 403 Forbidden');

    // Owner B attempting to access Store A1 (owned by Owner A)
    const crossAccessRes2 = await fetch(`${API_URL}/owner/stores/${storeA1Id}/ratings`, {
      headers: { Authorization: `Bearer ${ownerBToken}` },
    });
    assert(crossAccessRes2.status === 403, 'Owner B attempting to access Store A1 ratings rejected with 403 Forbidden');

    // 5. Testing Authorization & Role Restrictions
    console.log('\n--- 5. Testing Role Authorization & Access Restrictions ---');
    // USER attempting to access owner dashboard
    const userDashRes = await fetch(`${API_URL}/owner/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(userDashRes.status === 403, 'USER token accessing /api/owner/dashboard rejected with 403 Forbidden');

    // USER attempting to access store ratings
    const userRatingsRes = await fetch(`${API_URL}/owner/stores/${storeA1Id}/ratings`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(userRatingsRes.status === 403, 'USER token accessing /api/owner/stores/:storeId/ratings rejected with 403 Forbidden');

    // ADMIN attempting to access store owner ratings endpoint
    const adminRatingsRes = await fetch(`${API_URL}/owner/stores/${storeA1Id}/ratings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminRatingsRes.status === 403, 'ADMIN token accessing /api/owner/stores/:storeId/ratings rejected with 403 Forbidden');

    // Unauthenticated request (no JWT)
    const noJwtRes = await fetch(`${API_URL}/owner/dashboard`);
    assert(noJwtRes.status === 401, 'Unauthenticated request returns 401 Unauthorized');

    // 6. Testing Password Update for Store Owner
    console.log('\n--- 6. Testing Store Owner Password Update (PATCH /api/auth/password) ---');
    const newPass = 'NewOwnerPass999!';
    const changePassRes = await fetch(`${API_URL}/auth/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerAToken}` },
      body: JSON.stringify({ currentPassword: password, newPassword: newPass }),
    });
    assert(changePassRes.status === 200, 'STORE_OWNER A updated password successfully (200 OK)');

    // Verify login with new password
    const newPassLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerAEmail, password: newPass }),
    });
    assert(newPassLoginRes.status === 200, 'Logged in with new password successfully');

    console.log('\n====================================================');
    console.log(`🏁 PHASE 7 STORE OWNER TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
  } catch (error) {
    console.error('❌ CRITICAL ERROR IN TEST SUITE:', error);
  }
}

runOwnerTests();
