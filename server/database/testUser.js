const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const API_URL = 'http://localhost:5000/api';

async function runUserTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE PHASE 6 NORMAL USER TEST SUITE');
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

    // Setup Test Accounts
    console.log('--- 1. Setting Up Test Accounts (USER, ADMIN, STORE_OWNER) ---');
    const userEmail = `phase6_user_${timestamp}@example.com`;
    const user2Email = `phase6_user2_${timestamp}@example.com`;
    const adminEmail = `phase6_admin_${timestamp}@example.com`;
    const ownerEmail = `phase6_owner_${timestamp}@example.com`;
    const password = 'TestPassword123!';

    // Signup Normal User 1
    const user1SignupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Phase6 User One Account', email: userEmail, address: '123 User Street', password }),
    });
    assert(user1SignupRes.status === 201, 'Created test USER 1 via signup');
    const user1LoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password }),
    });
    const user1LoginJson = await user1LoginRes.json();
    const user1Token = user1LoginJson.data.token;
    const user1Id = user1LoginJson.data.user.id;
    assert(user1Token && user1Id, 'Obtained token & ID for test USER 1');

    // Signup Normal User 2
    const user2SignupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Phase6 User Two Account', email: user2Email, address: '456 User Lane', password }),
    });
    assert(user2SignupRes.status === 201, 'Created test USER 2 via signup');
    const user2LoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user2Email, password }),
    });
    const user2LoginJson = await user2LoginRes.json();
    const user2Token = user2LoginJson.data.token;
    const user2Id = user2LoginJson.data.user.id;
    assert(user2Token && user2Id, 'Obtained token & ID for test USER 2');

    // Signup Admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminInsert = await db.query('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', [
      'Phase6 Admin',
      adminEmail,
      hashedPassword,
      '999 Admin Blvd',
      'ADMIN',
    ]);
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    const adminLoginJson = await adminLoginRes.json();
    const adminToken = adminLoginJson.data.token;
    assert(adminToken && adminLoginJson.data.user.role === 'ADMIN', 'Created test ADMIN token');

    // Signup Store Owner
    await db.query('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', [
      'Phase6 Store Owner',
      ownerEmail,
      hashedPassword,
      '555 Owner Road',
      'STORE_OWNER',
    ]);
    const ownerLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerEmail, password }),
    });
    const ownerLoginJson = await ownerLoginRes.json();
    const ownerToken = ownerLoginJson.data.token;
    const ownerId = ownerLoginJson.data.user.id;
    assert(ownerToken && ownerLoginJson.data.user.role === 'STORE_OWNER', 'Created test STORE_OWNER token');

    // Create Test Store
    const storeRes = await fetch(`${API_URL}/admin/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Phase6 Mega Mart ${timestamp}`,
        email: `mart_${timestamp}@example.com`,
        address: '777 Shopping Hub Plaza',
        owner_id: ownerId,
      }),
    });
    const storeJson = await storeRes.json();
    const testStoreId = storeJson.data.id;
    assert(storeRes.status === 201 && testStoreId, 'Admin created new store for Phase 6 tests');

    // 2. Test Store Listing for Authenticated User
    console.log('\n--- 2. Testing Store Listing API (GET /api/stores) ---');
    const getStoresRes = await fetch(`${API_URL}/stores`, {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    const getStoresJson = await getStoresRes.json();
    assert(getStoresRes.status === 200, 'GET /api/stores HTTP status is 200 OK');
    const targetStore = getStoresJson.data.find((s) => s.id === testStoreId);
    assert(targetStore, 'Created store found in store listing');
    assert(targetStore.userRating === null, 'Unrated store has userRating = null for USER 1');

    // 3. Testing MySQL Search (Name, Address, Combined, Case-Insensitive)
    console.log('\n--- 3. Testing Backend MySQL Search Filtering ---');
    // Name Search
    const searchNameRes = await fetch(`${API_URL}/stores?name=Mega%20Mart`, {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    const searchNameJson = await searchNameRes.json();
    assert(searchNameJson.data.length > 0 && searchNameJson.data.some((s) => s.id === testStoreId), 'Search by Name returned matching store');

    // Address Search
    const searchAddressRes = await fetch(`${API_URL}/stores?address=Shopping%20Hub`, {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    const searchAddressJson = await searchAddressRes.json();
    assert(searchAddressJson.data.length > 0 && searchAddressJson.data.some((s) => s.id === testStoreId), 'Search by Address returned matching store');

    // Combined Search
    const searchCombinedRes = await fetch(`${API_URL}/stores?name=Mega&address=Plaza`, {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    const searchCombinedJson = await searchCombinedRes.json();
    assert(searchCombinedJson.data.length > 0 && searchCombinedJson.data.some((s) => s.id === testStoreId), 'Combined Name + Address search worked');

    // No-result Search
    const searchNoResultRes = await fetch(`${API_URL}/stores?name=NonExistentStoreUnique999`, {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    const searchNoResultJson = await searchNoResultRes.json();
    assert(searchNoResultJson.data.length === 0, 'No-result search returned empty array []');

    // 4. Testing Submit Rating (1–5)
    console.log('\n--- 4. Testing Rating Submission (POST /api/ratings) ---');
    const rate5Res = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user1Token}`,
      },
      body: JSON.stringify({ storeId: testStoreId, rating: 5 }),
    });
    const rate5Json = await rate5Res.json();
    if (rate5Res.status !== 200) console.log('DEBUG rate5 error:', rate5Res.status, rate5Json);
    assert(rate5Res.status === 200, 'USER 1 submitted 5-star rating (200 OK)');
    assert(rate5Json.data.rating === 5, 'Returned rating object contains rating = 5');

    // Verify User 1's listing now reflects userRating = 5
    const updatedListingRes = await fetch(`${API_URL}/stores`, {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    const updatedListingJson = await updatedListingRes.json();
    const storeForUser1 = updatedListingJson.data.find((s) => s.id === testStoreId);
    assert(storeForUser1.userRating === 5, "Store listing reflects USER 1's personal rating (userRating = 5)");
    assert(storeForUser1.overallRating === 5, 'Store overallRating recalculated to 5.0');

    // Verify User 2's listing sees overallRating = 5.0 but userRating = null
    const user2ListingRes = await fetch(`${API_URL}/stores`, {
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    const user2ListingJson = await user2ListingRes.json();
    const storeForUser2 = user2ListingJson.data.find((s) => s.id === testStoreId);
    assert(storeForUser2.userRating === null, 'USER 2 sees userRating = null (User 1 rating did NOT leak)');
    assert(storeForUser2.overallRating === 5, 'USER 2 sees correct community overallRating = 5.0');

    // 5. Testing Modify Rating
    console.log('\n--- 5. Testing Rating Modification (PATCH /api/ratings/:storeId) ---');
    const updateRateRes = await fetch(`${API_URL}/ratings/${testStoreId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user1Token}`,
      },
      body: JSON.stringify({ rating: 3 }),
    });
    const updateRateJson = await updateRateRes.json();
    assert(updateRateRes.status === 200, 'USER 1 modified existing rating to 3 stars');
    assert(updateRateJson.data.rating === 3, 'Modified rating object returns rating = 3');

    // Verify recalculated average
    const recheckRes = await fetch(`${API_URL}/stores`, {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    const recheckJson = await recheckRes.json();
    const recheckStore = recheckJson.data.find((s) => s.id === testStoreId);
    assert(recheckStore.userRating === 3, 'USER 1 personal userRating updated to 3');
    assert(recheckStore.overallRating === 3, 'Community overallRating recalculated to 3.0');

    // User 2 adds a 1-star rating
    await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user2Token}`,
      },
      body: JSON.stringify({ storeId: testStoreId, rating: 1 }),
    });
    // Ratings now: 3 (User 1) and 1 (User 2) -> Average: (3+1)/2 = 2.0
    const dualRes = await fetch(`${API_URL}/stores`, {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    const dualJson = await dualRes.json();
    const dualStore = dualJson.data.find((s) => s.id === testStoreId);
    assert(dualStore.overallRating === 2, 'Overall rating correctly aggregated dynamically with multiple users (3 + 1) / 2 = 2.0');

    // 6. Testing Validation & Edge Cases
    console.log('\n--- 6. Testing Rating Input Validation & Security Edge Cases ---');

    // Rating 0
    const rate0Res = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ storeId: testStoreId, rating: 0 }),
    });
    assert(rate0Res.status === 400, 'Rating = 0 rejected with 400 Bad Request');

    // Rating 6
    const rate6Res = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ storeId: testStoreId, rating: 6 }),
    });
    assert(rate6Res.status === 400, 'Rating = 6 rejected with 400 Bad Request');

    // Decimal 5.5
    const rateDecimalRes = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ storeId: testStoreId, rating: 5.5 }),
    });
    assert(rateDecimalRes.status === 400, 'Decimal rating 5.5 rejected with 400 Bad Request');

    // Non-existent Store
    const rateNonExistentRes = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ storeId: 999999, rating: 4 }),
    });
    assert(rateNonExistentRes.status === 404, 'Rating non-existent store rejected with 404 Not Found');

    // Identity Spoofing attempt (Body user_id = user2Id while JWT is user1Token)
    const spoofRes = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ storeId: testStoreId, rating: 4, user_id: user2Id }),
    });
    const user2CheckRes = await fetch(`${API_URL}/stores`, {
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    const user2CheckJson = await user2CheckRes.json();
    const user2Store = user2CheckJson.data.find((s) => s.id === testStoreId);
    assert(user2Store.userRating === 1, 'Body user_id override ignored; rating bound strictly to JWT user (User 2 rating unchanged)');

    // 7. Testing Authorization Restrictions
    console.log('\n--- 7. Testing Authorization & Role Restrictions ---');
    // Missing JWT
    const noJwtRes = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId: testStoreId, rating: 4 }),
    });
    assert(noJwtRes.status === 401, 'Unauthenticated rating submission rejected with 401 Unauthorized');

    // ADMIN attempt to rate
    const adminRateRes = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ storeId: testStoreId, rating: 4 }),
    });
    assert(adminRateRes.status === 403, 'ADMIN token attempting rating submission rejected with 403 Forbidden');

    // STORE_OWNER attempt to rate
    const ownerRateRes = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ storeId: testStoreId, rating: 4 }),
    });
    assert(ownerRateRes.status === 403, 'STORE_OWNER token attempting rating submission rejected with 403 Forbidden');

    // 8. Testing Password Update for Normal User
    console.log('\n--- 8. Testing Normal User Password Update (PATCH /api/auth/password) ---');
    const newPass = 'NewPassword999!';
    const changePassRes = await fetch(`${API_URL}/auth/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ currentPassword: password, newPassword: newPass }),
    });
    assert(changePassRes.status === 200, 'Normal User updated password successfully (200 OK)');

    // Verify login with new password
    const newPassLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password: newPass }),
    });
    assert(newPassLoginRes.status === 200, 'Logged in with new password successfully');

    console.log('\n====================================================');
    console.log(`🏁 PHASE 6 NORMAL USER TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
  } catch (error) {
    console.error('❌ CRITICAL ERROR IN TEST SUITE:', error);
  }
}

runUserTests();
