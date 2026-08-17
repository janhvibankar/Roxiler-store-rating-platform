const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const API_URL = 'http://localhost:5000/api';

async function runAuthTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE PHASE 3 AUTHENTICATION TEST SUITE');
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
    // 1. Test Public Signup
    console.log('--- 1. Testing Public Signup (POST /api/auth/signup) ---');
    const timestamp = Date.now();
    const testEmail = `auth_test_${timestamp}@example.com`;
    const signupData = {
      name: 'Auth Test User Account',
      email: testEmail,
      address: '777 Test Avenue',
      password: 'TestPassword123!',
      role: 'ADMIN', // Malicious client attempt to claim ADMIN role
    };

    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    });
    const signupJson = await signupRes.json();

    assert(signupRes.status === 201, 'Signup HTTP status is 201 Created');
    assert(signupJson.data.role === 'USER', 'Public signup forced role = USER (ignored ADMIN override)');
    assert(!signupJson.data.password, 'Password is NOT returned in signup response');

    // Verify bcrypt hash in MySQL
    const userInDb = await db.query('SELECT * FROM users WHERE email = ?', [testEmail]);
    assert(userInDb[0] && userInDb[0].password.startsWith('$2'), 'Password stored as bcrypt hash in MySQL');

    // Test Duplicate Email Signup
    console.log('\n--- 2. Testing Duplicate Email Signup Rejection ---');
    const dupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    });
    const dupJson = await dupRes.json();
    assert(dupRes.status === 409, `Duplicate email rejected with 409 (${dupJson.message})`);

    // Test Password Validation Rules
    console.log('\n--- 3. Testing Password Validation Rules ---');
    const weakRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Weak Pass User Account',
        email: `weak_${timestamp}@example.com`,
        address: 'Addr',
        password: 'weak',
      }),
    });
    const weakJson = await weakRes.json();
    assert(weakRes.status === 400, `Weak password rejected with 400 (${weakJson.message})`);

    // 2. Test Login for All Roles
    console.log('\n--- 4. Testing Single Login Endpoint (POST /api/auth/login) ---');

    // Test User Login
    const userLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
      }),
    });
    const userLoginJson = await userLoginRes.json();
    assert(userLoginRes.status === 200, 'USER login HTTP status 200');
    assert(userLoginJson.data.token, 'JWT token returned on login');
    assert(!userLoginJson.data.user.password, 'User object does NOT contain password');

    // Inspect JWT payload
    const decodedUserToken = jwt.decode(userLoginJson.data.token);
    assert(
      decodedUserToken.userId === signupJson.data.id && decodedUserToken.role === 'USER',
      'JWT payload contains correct userId and role'
    );
    assert(!decodedUserToken.password, 'JWT payload does NOT contain password');

    // Test Seeded ADMIN Login
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@storerating.com',
        password: 'AdminPass123!',
      }),
    });
    const adminLoginJson = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'ADMIN login successful');
    assert(adminLoginJson.data.user.role === 'ADMIN', 'ADMIN role returned in response data');

    // Test Seeded STORE_OWNER Login
    const ownerLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@storerating.com',
        password: 'OwnerPass123!',
      }),
    });
    const ownerLoginJson = await ownerLoginRes.json();
    assert(ownerLoginRes.status === 200, 'STORE_OWNER login successful');
    assert(ownerLoginJson.data.user.role === 'STORE_OWNER', 'STORE_OWNER role returned in response data');

    // Test Login Invalid Credentials
    console.log('\n--- 5. Testing Login Failure Handling ---');
    const wrongPassRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword123!',
      }),
    });
    const wrongPassJson = await wrongPassRes.json();
    assert(wrongPassRes.status === 401, `Wrong password rejected with 401 (${wrongPassJson.message})`);

    const noUserRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      }),
    });
    const noUserJson = await noUserRes.json();
    assert(noUserRes.status === 401, `Non-existent email rejected with 401 (${noUserJson.message})`);

    // 3. Test Protected GET /api/auth/me
    console.log('\n--- 6. Testing Current User Endpoint (GET /api/auth/me) ---');
    const userToken = userLoginJson.data.token;

    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const meJson = await meRes.json();
    assert(meRes.status === 200, 'GET /api/auth/me HTTP status 200 with valid JWT');
    assert(meJson.data.email === testEmail, 'Returned correct current user profile');
    assert(!meJson.data.password, 'Current user response does NOT return password');

    // Test Missing & Tampered Token
    const noTokenRes = await fetch(`${API_URL}/auth/me`);
    assert(noTokenRes.status === 401, 'Missing token rejected with 401');

    const badTokenRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: 'Bearer invalid_tampered_token_string' },
    });
    assert(badTokenRes.status === 401, 'Invalid token rejected with 401');

    // 4. Test Change Password (PATCH /api/auth/password)
    console.log('\n--- 7. Testing Change Password Endpoint (PATCH /api/auth/password) ---');
    const changePassRes = await fetch(`${API_URL}/auth/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'TestPassword123!',
        newPassword: 'NewPass123!', // Valid 11 character password
      }),
    });
    const changePassJson = await changePassRes.json();
    assert(changePassRes.status === 200, 'PATCH /api/auth/password HTTP status 200');

    // Test Old Password stops working
    const oldPassRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
      }),
    });
    assert(oldPassRes.status === 401, 'Old password rejected after password change');

    // Test New Password works for login
    const newPassLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'NewPass123!',
      }),
    });
    assert(newPassLoginRes.status === 200, 'New password logs in successfully');

    console.log('\n====================================================');
    console.log(`🏁 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Fatal error during auth test execution:', error);
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

if (require.main === module) {
  runAuthTests();
}
