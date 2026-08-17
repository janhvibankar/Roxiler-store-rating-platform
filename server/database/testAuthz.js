const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const API_URL = 'http://localhost:5000/api';

async function runAuthzTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE PHASE 4 AUTHORIZATION TEST SUITE');
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

    // 1. Obtain Tokens for All Three Roles
    console.log('--- 1. Authenticating Test Accounts ---');

    // ADMIN Login
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@storerating.com', password: 'AdminPass123!' }),
    });
    const adminLoginJson = await adminLoginRes.json();
    const adminToken = adminLoginJson.data.token;
    assert(adminToken && adminLoginJson.data.user.role === 'ADMIN', 'Obtained valid ADMIN JWT');

    // USER Login
    const userLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@storerating.com', password: 'UserPass123!' }),
    });
    const userLoginJson = await userLoginRes.json();
    const userToken = userLoginJson.data.token;
    assert(userToken && userLoginJson.data.user.role === 'USER', 'Obtained valid USER JWT');

    // STORE_OWNER 1 Login (Seed owner id: 3)
    const owner1LoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@storerating.com', password: 'OwnerPass123!' }),
    });
    const owner1LoginJson = await owner1LoginRes.json();
    const owner1Token = owner1LoginJson.data.token;
    const owner1Id = owner1LoginJson.data.user.id;
    assert(owner1Token && owner1LoginJson.data.user.role === 'STORE_OWNER', 'Obtained valid STORE_OWNER 1 JWT');

    // Create STORE_OWNER 2 via Admin endpoint for ownership testing
    const owner2Email = `owner2_${timestamp}_${Math.floor(Math.random()*1000)}@storerating.com`;
    const createOwner2Res = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Second Store Owner Account',
        email: owner2Email,
        address: '555 Owner Lane',
        password: 'OwnerPass123!',
        role: 'STORE_OWNER',
      }),
    });
    const createOwner2Json = await createOwner2Res.json();
    const owner2Id = createOwner2Json.data.id;
    assert(createOwner2Res.status === 201 && createOwner2Json.data.role === 'STORE_OWNER', 'ADMIN created second STORE_OWNER account');

    // STORE_OWNER 2 Login
    const owner2LoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: owner2Email, password: 'OwnerPass123!' }),
    });
    const owner2LoginJson = await owner2LoginRes.json();
    const owner2Token = owner2LoginJson.data.token;
    assert(owner2Token, 'Obtained valid STORE_OWNER 2 JWT');

    // 2. Test Admin Endpoint Authorization
    console.log('\n--- 2. Testing ADMIN Route Restrictions (GET /api/admin/dashboard) ---');
    const adminDashRes = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminDashRes.status === 200, 'ADMIN token accesses /api/admin/dashboard successfully (200 OK)');

    const userAdminDashRes = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(userAdminDashRes.status === 403, 'USER token accessing /api/admin/dashboard rejected with 403 Forbidden');

    const ownerAdminDashRes = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${owner1Token}` },
    });
    assert(ownerAdminDashRes.status === 403, 'STORE_OWNER token accessing /api/admin/dashboard rejected with 403 Forbidden');

    // 3. Test Normal User Endpoint Authorization
    console.log('\n--- 3. Testing USER Route Restrictions (GET /api/users/me-test) ---');
    const userTestRes = await fetch(`${API_URL}/users/me-test`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(userTestRes.status === 200, 'USER token accesses /api/users/me-test successfully (200 OK)');

    const adminUserTestRes = await fetch(`${API_URL}/users/me-test`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminUserTestRes.status === 403, 'ADMIN token accessing /api/users/me-test rejected with 403 Forbidden');

    // 4. Test Store Owner Assignment Validation
    console.log('\n--- 4. Testing Store Owner Assignment Validation ---');

    // Attempting to assign normal USER as owner_id
    const badOwnerUserRes = await fetch(`${API_URL}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Owner Store 1',
        email: `invalid1_${timestamp}@store.com`,
        address: '123 Fake St',
        owner_id: userLoginJson.data.user.id,
      }),
    });
    const badOwnerUserJson = await badOwnerUserRes.json();
    assert(badOwnerUserRes.status === 400, `Assigning USER as owner_id rejected with 400 (${badOwnerUserJson.message})`);

    // Attempting to assign ADMIN as owner_id
    const badOwnerAdminRes = await fetch(`${API_URL}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Owner Store 2',
        email: `invalid2_${timestamp}@store.com`,
        address: '123 Fake St',
        owner_id: adminLoginJson.data.user.id,
      }),
    });
    const badOwnerAdminJson = await badOwnerAdminRes.json();
    assert(badOwnerAdminRes.status === 400, `Assigning ADMIN as owner_id rejected with 400 (${badOwnerAdminJson.message})`);

    // Create Store 2 assigned to STORE_OWNER 2 (id: owner2Id)
    const createStore2Res = await fetch(`${API_URL}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Store 2 ${timestamp}`,
        email: `store2_${timestamp}@store.com`,
        address: '888 Second Boulevard',
        owner_id: owner2Id,
      }),
    });
    const createStore2Json = await createStore2Res.json();
    const store2Id = createStore2Json.data.id;
    assert(createStore2Res.status === 201, 'Assigning valid STORE_OWNER as owner_id created store successfully');

    // 5. Test Store Ownership Verification
    console.log('\n--- 5. Testing Store Ownership Verification (GET /api/stores/:id/owner-dashboard) ---');

    // Store Owner 1 accessing Store 1 (Seeded store 1 is owned by owner1Id = 3)
    const owner1Store1Res = await fetch(`${API_URL}/stores/1/owner-dashboard`, {
      headers: { Authorization: `Bearer ${owner1Token}` },
    });
    assert(owner1Store1Res.status === 200, 'STORE_OWNER 1 accessing Store 1 allowed (200 OK)');

    // Store Owner 1 accessing Store 2 (owned by owner2Id)
    const owner1Store2Res = await fetch(`${API_URL}/stores/${store2Id}/owner-dashboard`, {
      headers: { Authorization: `Bearer ${owner1Token}` },
    });
    const owner1Store2Json = await owner1Store2Res.json();
    assert(owner1Store2Res.status === 403, `STORE_OWNER 1 accessing Store 2 rejected with 403 Forbidden (${owner1Store2Json.message})`);

    // Store Owner 2 accessing Store 2
    const owner2Store2Res = await fetch(`${API_URL}/stores/${store2Id}/owner-dashboard`, {
      headers: { Authorization: `Bearer ${owner2Token}` },
    });
    assert(owner2Store2Res.status === 200, 'STORE_OWNER 2 accessing Store 2 allowed (200 OK)');

    // USER accessing Store 1 owner dashboard
    const userStore1Res = await fetch(`${API_URL}/stores/1/owner-dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(userStore1Res.status === 403, 'USER accessing owner dashboard rejected with 403 Forbidden');

    // 6. Test Privilege Escalation Protection
    console.log('\n--- 6. Testing Privilege Escalation Protection ---');
    const hackerEmail = `hacker_${timestamp}_${Math.floor(Math.random()*1000)}@example.com`;
    const escSignupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker User Account Name',
        email: hackerEmail,
        address: 'Hacker Alley',
        password: 'HackPass123!', // Valid 11 char password
        role: 'ADMIN',
      }),
    });
    const escSignupJson = await escSignupRes.json();
    assert(escSignupRes.status === 201 && escSignupJson.data.role === 'USER', 'Public signup with role=ADMIN forced to USER');

    const nonAdminUserCreateRes = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'Illegal Admin',
        email: `illegal_${timestamp}@example.com`,
        address: 'Address',
        password: 'HackPass123!',
        role: 'ADMIN',
      }),
    });
    assert(nonAdminUserCreateRes.status === 403, 'Non-admin attempt to create users via /api/admin/users rejected with 403');

    // 7. Test HTTP Status Codes
    console.log('\n--- 7. Testing HTTP Status Codes Standard Compliance ---');
    const noTokenRes = await fetch(`${API_URL}/admin/dashboard`);
    assert(noTokenRes.status === 401, 'Unauthenticated request returns 401 Unauthorized');

    const badTokenRes = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: 'Bearer fake_invalid_token' },
    });
    assert(badTokenRes.status === 401, 'Invalid token returns 401 Unauthorized');

    const wrongRoleRes = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(wrongRoleRes.status === 403, 'Valid token with wrong role returns 403 Forbidden');

    console.log('\n====================================================');
    console.log(`🏁 PHASE 4 AUTHORIZATION TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Fatal error during authz test execution:', error);
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

if (require.main === module) {
  runAuthzTests();
}
