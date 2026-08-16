const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const API_URL = 'http://localhost:5000/api';

async function runAdminTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE PHASE 5 ADMIN TEST SUITE');
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

    // 1. Authenticate Roles
    console.log('--- 1. Authenticating Admin, User, and Store Owner Accounts ---');

    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@storerating.com', password: 'AdminPass123!' }),
    });
    const adminLoginJson = await adminLoginRes.json();
    const adminToken = adminLoginJson.data.token;
    assert(adminToken && adminLoginJson.data.user.role === 'ADMIN', 'ADMIN login successful');

    const userLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@storerating.com', password: 'UserPass123!' }),
    });
    const userLoginJson = await userLoginRes.json();
    const userToken = userLoginJson.data.token;
    assert(userToken && userLoginJson.data.user.role === 'USER', 'USER login successful');

    const ownerLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@storerating.com', password: 'OwnerPass123!' }),
    });
    const ownerLoginJson = await ownerLoginRes.json();
    const ownerToken = ownerLoginJson.data.token;
    const ownerId = ownerLoginJson.data.user.id;
    assert(ownerToken && ownerLoginJson.data.user.role === 'STORE_OWNER', 'STORE_OWNER login successful');

    // 2. Test Admin Dashboard Statistics
    console.log('\n--- 2. Testing Admin Dashboard Statistics (GET /api/admin/dashboard) ---');
    const dashRes = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashJson = await dashRes.json();
    assert(dashRes.status === 200, 'ADMIN retrieved dashboard statistics (200 OK)');

    const expectedUserCount = (await db.query('SELECT COUNT(*) AS count FROM users'))[0].count;
    const expectedStoreCount = (await db.query('SELECT COUNT(*) AS count FROM stores'))[0].count;
    const expectedRatingCount = (await db.query('SELECT COUNT(*) AS count FROM ratings'))[0].count;

    assert(dashJson.data.totalUsers === expectedUserCount, `totalUsers count matches MySQL (${dashJson.data.totalUsers})`);
    assert(dashJson.data.totalStores === expectedStoreCount, `totalStores count matches MySQL (${dashJson.data.totalStores})`);
    assert(dashJson.data.totalRatings === expectedRatingCount, `totalRatings count matches MySQL (${dashJson.data.totalRatings})`);

    const userDashRes = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(userDashRes.status === 403, 'USER token accessing dashboard rejected with 403 Forbidden');

    const ownerDashRes = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(ownerDashRes.status === 403, 'STORE_OWNER token accessing dashboard rejected with 403 Forbidden');

    // 3. Test Admin User Creation
    console.log('\n--- 3. Testing Admin User Creation (POST /api/admin/users) ---');
    const newNormalEmail = `admin_created_user_${timestamp}@example.com`;
    const createNormalRes = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Admin Created Normal User',
        email: newNormalEmail,
        address: '123 Created St',
        password: 'UserPass123!',
        role: 'USER',
      }),
    });
    const createNormalJson = await createNormalRes.json();
    assert(createNormalRes.status === 201 && createNormalJson.data.role === 'USER', 'Admin created USER account successfully');
    assert(!createNormalJson.data.password, 'Password is NOT returned in user creation response');

    const newAdminEmail = `admin_created_admin_${timestamp}@example.com`;
    const createAdminRes = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Admin Created Admin User',
        email: newAdminEmail,
        address: '456 Created St',
        password: 'AdminPass123!',
        role: 'ADMIN',
      }),
    });
    const createAdminJson = await createAdminRes.json();
    assert(createAdminRes.status === 201 && createAdminJson.data.role === 'ADMIN', 'Admin created ADMIN account successfully');

    // Test Non-admin user creation rejection
    const nonAdminCreateRes = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'Illegal User',
        email: `illegal_${timestamp}@example.com`,
        address: 'Address',
        password: 'UserPass123!',
        role: 'USER',
      }),
    });
    assert(nonAdminCreateRes.status === 403, 'USER attempting to call /api/admin/users rejected with 403 Forbidden');

    // Test Duplicate Email
    const dupUserRes = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Duplicate Email User',
        email: newNormalEmail,
        address: 'Address',
        password: 'UserPass123!',
        role: 'USER',
      }),
    });
    assert(dupUserRes.status === 409, 'Duplicate email user creation rejected with 409 Conflict');

    // 4. Test Admin Store Creation
    console.log('\n--- 4. Testing Admin Store Creation (POST /api/admin/stores) ---');
    const storeName = `Admin Created Store ${timestamp}`;
    const createStoreRes = await fetch(`${API_URL}/admin/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: storeName,
        email: `store_${timestamp}@example.com`,
        address: '999 Admin Commerce Way',
        owner_id: ownerId,
      }),
    });
    const createStoreJson = await createStoreRes.json();
    assert(createStoreRes.status === 201 && createStoreJson.data.owner_id === ownerId, 'Admin created store with valid STORE_OWNER');

    // Test Invalid Store Owner (USER or ADMIN)
    const badOwnerStoreRes = await fetch(`${API_URL}/admin/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Bad Owner Store',
        email: `bad_owner_${timestamp}@example.com`,
        address: 'Address',
        owner_id: createNormalJson.data.id, // USER id
      }),
    });
    assert(badOwnerStoreRes.status === 400, 'Assigning USER as owner_id rejected with 400 Bad Request');

    // 5. Test Admin User Listing & Filtering
    console.log('\n--- 5. Testing Admin User Listing & Backend Filtering (GET /api/admin/users) ---');
    const usersListRes = await fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersListJson = await usersListRes.json();
    assert(usersListRes.status === 200, 'Admin retrieved user listing');

    const hasStoreOwnersInListing = usersListJson.data.some((u) => u.role === 'STORE_OWNER');
    assert(!hasStoreOwnersInListing, 'Admin users listing contains only USER and ADMIN roles (STORE_OWNER excluded)');

    // Test Filter by role = ADMIN
    const filterRoleRes = await fetch(`${API_URL}/admin/users?role=ADMIN`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const filterRoleJson = await filterRoleRes.json();
    const allFilteredAreAdmin = filterRoleJson.data.every((u) => u.role === 'ADMIN');
    assert(filterRoleRes.status === 200 && allFilteredAreAdmin, 'Backend filtering by role=ADMIN returned only ADMIN accounts');

    // 6. Test Admin Store Listing & Filtering
    console.log('\n--- 6. Testing Admin Store Listing & SQL AVG Rating (GET /api/admin/stores) ---');
    const storesListRes = await fetch(`${API_URL}/admin/stores`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const storesListJson = await storesListRes.json();
    assert(storesListRes.status === 200, 'Admin retrieved store listing');

    const createdStoreInList = storesListJson.data.find((s) => s.id === createStoreJson.data.id);
    assert(createdStoreInList && createdStoreInList.rating === null, 'Newly created store with no ratings returns rating: null');

    // Test Filter by Store Name
    const filterStoreNameRes = await fetch(`${API_URL}/admin/stores?name=${encodeURIComponent(storeName)}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const filterStoreNameJson = await filterStoreNameRes.json();
    assert(filterStoreNameJson.data.length === 1 && filterStoreNameJson.data[0].name === storeName, 'Backend filtering by store name returned correct record');

    // 7. Test Admin User Details
    console.log('\n--- 7. Testing Admin User Details Endpoint (GET /api/admin/users/:id) ---');

    // Normal User Details
    const userDetailsRes = await fetch(`${API_URL}/admin/users/${createNormalJson.data.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const userDetailsJson = await userDetailsRes.json();
    assert(userDetailsRes.status === 200 && userDetailsJson.data.id === createNormalJson.data.id, 'Retrieved normal user details successfully');
    assert(!userDetailsJson.data.password, 'User details response does NOT contain password');

    // Store Owner User Details (with owned store & average rating)
    const ownerDetailsRes = await fetch(`${API_URL}/admin/users/${ownerId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const ownerDetailsJson = await ownerDetailsRes.json();
    assert(ownerDetailsRes.status === 200 && ownerDetailsJson.data.role === 'STORE_OWNER', 'Retrieved STORE_OWNER user details');
    assert(ownerDetailsJson.data.ownedStore !== undefined, 'STORE_OWNER details response includes ownedStore information');

    // Non-admin user details access rejection
    const nonAdminDetailsRes = await fetch(`${API_URL}/admin/users/${createNormalJson.data.id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(nonAdminDetailsRes.status === 403, 'USER token accessing /api/admin/users/:id rejected with 403 Forbidden');

    console.log('\n====================================================');
    console.log(`🏁 PHASE 5 ADMIN TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Fatal error during admin test execution:', error);
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

if (require.main === module) {
  runAdminTests();
}
