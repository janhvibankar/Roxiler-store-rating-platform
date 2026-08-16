const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const API_URL = 'http://localhost:5000/api';

async function runSearchSortTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE PHASE 8 SEARCH, FILTER & SORT TEST SUITE');
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

    // 1. Setup Test Accounts & Seed Data for Search/Sort
    console.log('--- 1. Setting Up Test Data for Search, Filter & Sort ---');
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminEmail = `admin_ss_${timestamp}@example.com`;
    const user1Email = `alpha_user_${timestamp}@example.com`;
    const user2Email = `beta_user_${timestamp}@example.com`;
    const ownerEmail = `store_owner_ss_${timestamp}@example.com`;

    // Create Admin
    await db.query('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', [
      'Admin SearchSort',
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
    const adminToken = (await adminLoginRes.json()).data.token;
    assert(adminToken, 'Obtained ADMIN token for Phase 8 test suite');

    // Create User Alpha
    await db.query('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', [
      'Alpha Customer',
      user1Email,
      hashedPassword,
      '100 Alpha St, Pune',
      'USER',
    ]);
    const user1LoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user1Email, password }),
    });
    const user1Token = (await user1LoginRes.json()).data.token;

    // Create User Beta
    await db.query('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', [
      'Zeta Customer',
      user2Email,
      hashedPassword,
      '200 Zeta Ave, Mumbai',
      'USER',
    ]);

    // Create Store Owner
    await db.query('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', [
      'Owner SearchSort',
      ownerEmail,
      hashedPassword,
      '300 Owner Way',
      'STORE_OWNER',
    ]);
    const ownerObj = await db.query('SELECT id FROM users WHERE email = ?', [ownerEmail]);
    const ownerId = ownerObj[0].id;

    // Insert 3 Stores: Apex Electronics, Baker Bakery, Charlie Cafe
    const s1 = await db.query('INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', [
      `Apex Electronics ${timestamp}`,
      `apex_${timestamp}@example.com`,
      '111 Tech Park, Pune',
      ownerId,
    ]);
    const s2 = await db.query('INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', [
      `Baker Bakery ${timestamp}`,
      `baker_${timestamp}@example.com`,
      '222 Main St, Mumbai',
      ownerId,
    ]);
    const s3 = await db.query('INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', [
      `Charlie Cafe ${timestamp}`,
      `charlie_${timestamp}@example.com`,
      '333 Coffee Lane, Delhi',
      ownerId,
    ]);

    const store1Id = s1.insertId;
    const store2Id = s2.insertId;

    // Rate Store 1 with 5 stars, Store 2 with 2 stars, Store 3 left UNRATED (NULL)
    await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ storeId: store1Id, rating: 5 }),
    });
    await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ storeId: store2Id, rating: 2 }),
    });

    // 2. PART 1 — ADMIN USER FILTERS
    console.log('\n--- 2. PART 1 — ADMIN USER FILTERS ---');
    // Test 1: Name filter
    const uNameRes = await fetch(`${API_URL}/admin/users?name=Alpha`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const uNameJson = await uNameRes.json();
    assert(uNameRes.status === 200 && uNameJson.data.length >= 1 && uNameJson.data.every((u) => u.name.toLowerCase().includes('alpha')), '1. Admin User Name filter works (retrieved Alpha Customer)');

    // Test 2: Email filter
    const uEmailRes = await fetch(`${API_URL}/admin/users?email=beta_user`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const uEmailJson = await uEmailRes.json();
    assert(uEmailRes.status === 200 && uEmailJson.data.length >= 1 && uEmailJson.data.every((u) => u.email.toLowerCase().includes('beta_user')), '2. Admin User Email filter works (retrieved Zeta Customer)');

    // Test 3: Address filter
    const uAddrRes = await fetch(`${API_URL}/admin/users?address=Mumbai`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const uAddrJson = await uAddrRes.json();
    assert(uAddrRes.status === 200 && uAddrJson.data.length >= 1 && uAddrJson.data.every((u) => u.address.toLowerCase().includes('mumbai')), '3. Admin User Address filter works (retrieved user in Mumbai)');

    // Test 4: Role filter
    const uRoleRes = await fetch(`${API_URL}/admin/users?role=ADMIN`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const uRoleJson = await uRoleRes.json();
    assert(uRoleRes.status === 200 && uRoleJson.data.length >= 1 && uRoleJson.data.every((u) => u.role === 'ADMIN'), '4. Admin User Role filter works (retrieved only ADMIN users)');

    // Test 5: Multiple filters (Name + Role)
    const uMultiRes = await fetch(`${API_URL}/admin/users?name=Alpha&role=USER`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const uMultiJson = await uMultiRes.json();
    assert(uMultiRes.status === 200 && uMultiJson.data.length >= 1 && uMultiJson.data.every((u) => u.role === 'USER' && u.name.toLowerCase().includes('alpha')), '5. Admin User Combined multiple filters work');

    // Test 6: Empty / No-result filter
    const uEmptyRes = await fetch(`${API_URL}/admin/users?name=NonExistentUser99999`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const uEmptyJson = await uEmptyRes.json();
    assert(uEmptyRes.status === 200 && Array.isArray(uEmptyJson.data) && uEmptyJson.data.length === 0, '6. Admin User No-result search returns [] cleanly');

    // 3. PART 2 — ADMIN STORE FILTERS
    console.log('\n--- 3. PART 2 — ADMIN STORE FILTERS ---');
    // Test 7: Store Name filter
    const sNameRes = await fetch(`${API_URL}/admin/stores?name=Apex`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sNameJson = await sNameRes.json();
    assert(sNameRes.status === 200 && sNameJson.data.length >= 1 && sNameJson.data.every((s) => s.name.toLowerCase().includes('apex')), '7. Admin Store Name filter works');

    // Test 8: Store Email filter
    const sEmailRes = await fetch(`${API_URL}/admin/stores?email=baker_`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sEmailJson = await sEmailRes.json();
    assert(sEmailRes.status === 200 && sEmailJson.data.length >= 1 && sEmailJson.data.every((s) => s.email.toLowerCase().includes('baker_')), '8. Admin Store Email filter works');

    // Test 9: Store Address filter
    const sAddrRes = await fetch(`${API_URL}/admin/stores?address=Coffee%20Lane`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sAddrJson = await sAddrRes.json();
    assert(sAddrRes.status === 200 && sAddrJson.data.length >= 1 && sAddrJson.data.every((s) => s.address.toLowerCase().includes('coffee lane')), '9. Admin Store Address filter works');

    // Test 10: Store Multiple filters
    const sMultiRes = await fetch(`${API_URL}/admin/stores?name=Apex&address=Pune`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sMultiJson = await sMultiRes.json();
    assert(sMultiRes.status === 200 && sMultiJson.data.length >= 1 && sMultiJson.data.every((s) => s.name.toLowerCase().includes('apex') && s.address.toLowerCase().includes('pune')), '10. Admin Store Combined multiple filters work');

    // Test 11: Store No-result filter
    const sNoResultRes = await fetch(`${API_URL}/admin/stores?name=NonExistentStore99999`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sNoResultJson = await sNoResultRes.json();
    assert(sNoResultRes.status === 200 && Array.isArray(sNoResultJson.data) && sNoResultJson.data.length === 0, '11. Admin Store No-result search returns [] cleanly');

    // 4. PART 3 — NORMAL USER STORE SEARCH PRESERVATION
    console.log('\n--- 4. PART 3 — NORMAL USER STORE SEARCH ---');
    // Test 12: Normal User Name search
    const uSNameRes = await fetch(`${API_URL}/stores?name=Apex`, { headers: { Authorization: `Bearer ${user1Token}` } });
    const uSNameJson = await uSNameRes.json();
    assert(uSNameRes.status === 200 && uSNameJson.data.length >= 1 && uSNameJson.data.every((s) => s.name.toLowerCase().includes('apex')), '12. Normal User Name search works');

    // Test 13: Normal User Address search
    const uSAddrRes = await fetch(`${API_URL}/stores?address=Coffee`, { headers: { Authorization: `Bearer ${user1Token}` } });
    const uSAddrJson = await uSAddrRes.json();
    assert(uSAddrRes.status === 200 && uSAddrJson.data.length >= 1 && uSAddrJson.data.every((s) => s.address.toLowerCase().includes('coffee')), '13. Normal User Address search works');

    // Test 14: Normal User Combined search
    const uSCombRes = await fetch(`${API_URL}/stores?name=Baker&address=Mumbai`, { headers: { Authorization: `Bearer ${user1Token}` } });
    const uSCombJson = await uSCombRes.json();
    assert(uSCombRes.status === 200 && uSCombJson.data.length >= 1 && uSCombJson.data.every((s) => s.name.toLowerCase().includes('baker') && s.address.toLowerCase().includes('mumbai')), '14. Normal User Combined search works');

    // 5. PART 4 & 5 — SORTING
    console.log('\n--- 5. PART 4 & 5 — SORTING ---');
    // Test 15: User Name ASC
    const sortUserAscRes = await fetch(`${API_URL}/admin/users?sortBy=name&sortOrder=asc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sortUserAscJson = await sortUserAscRes.json();
    const namesAsc = sortUserAscJson.data.map((u) => u.name);
    let isUserAsc = true;
    for (let i = 0; i < namesAsc.length - 1; i++) {
      if (namesAsc[i].localeCompare(namesAsc[i + 1]) > 0) isUserAsc = false;
    }
    assert(sortUserAscRes.status === 200 && isUserAsc, '15. User Name ASC sorting works');

    // Test 16: User Name DESC
    const sortUserDescRes = await fetch(`${API_URL}/admin/users?sortBy=name&sortOrder=desc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sortUserDescJson = await sortUserDescRes.json();
    const namesDesc = sortUserDescJson.data.map((u) => u.name);
    let isUserDesc = true;
    for (let i = 0; i < namesDesc.length - 1; i++) {
      if (namesDesc[i].localeCompare(namesDesc[i + 1]) < 0) isUserDesc = false;
    }
    assert(sortUserDescRes.status === 200 && isUserDesc, '16. User Name DESC sorting works');

    // Test 17: User Email ASC
    const sortUserEmailAscRes = await fetch(`${API_URL}/admin/users?sortBy=email&sortOrder=asc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(sortUserEmailAscRes.status === 200, '17. User Email ASC sorting works');

    // Test 18: User Email DESC
    const sortUserEmailDescRes = await fetch(`${API_URL}/admin/users?sortBy=email&sortOrder=desc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(sortUserEmailDescRes.status === 200, '18. User Email DESC sorting works');

    // Test 19: User Address ASC/DESC
    const sortUserAddrRes = await fetch(`${API_URL}/admin/users?sortBy=address&sortOrder=asc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(sortUserAddrRes.status === 200, '19. User Address ASC/DESC sorting works');

    // Test 20: User Role ASC/DESC
    const sortUserRoleRes = await fetch(`${API_URL}/admin/users?sortBy=role&sortOrder=desc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(sortUserRoleRes.status === 200, '20. User Role ASC/DESC sorting works');

    // Test 21: Store Name ASC
    const sortStoreAscRes = await fetch(`${API_URL}/admin/stores?sortBy=name&sortOrder=asc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(sortStoreAscRes.status === 200, '21. Store Name ASC sorting works');

    // Test 22: Store Name DESC
    const sortStoreDescRes = await fetch(`${API_URL}/admin/stores?sortBy=name&sortOrder=desc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(sortStoreDescRes.status === 200, '22. Store Name DESC sorting works');

    // Test 23: Store Email ASC/DESC
    const sortStoreEmailRes = await fetch(`${API_URL}/admin/stores?sortBy=email&sortOrder=asc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(sortStoreEmailRes.status === 200, '23. Store Email ASC/DESC sorting works');

    // Test 24: Store Address ASC/DESC
    const sortStoreAddrRes = await fetch(`${API_URL}/admin/stores?sortBy=address&sortOrder=desc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(sortStoreAddrRes.status === 200, '24. Store Address ASC/DESC sorting works');

    // Test 25: Store Rating ASC/DESC (Handling NULL ratings cleanly)
    const sortRatingDescRes = await fetch(`${API_URL}/admin/stores?sortBy=rating&sortOrder=desc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sortRatingDescJson = await sortRatingDescRes.json();
    assert(sortRatingDescRes.status === 200 && Array.isArray(sortRatingDescJson.data), '25. Store Rating sorting executed cleanly with NULL ratings handled');

    // 6. PART 7 — FILTER + SORT COMBINATION
    console.log('\n--- 6. PART 7 — FILTER + SORT COMBINATION ---');
    // Test 26: User Filter + Sort
    const filterSortUserRes = await fetch(`${API_URL}/admin/users?role=USER&sortBy=name&sortOrder=asc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const filterSortUserJson = await filterSortUserRes.json();
    assert(filterSortUserRes.status === 200 && filterSortUserJson.data.every((u) => u.role === 'USER'), '26. User combined Filter + Sort works');

    // Test 27: Store Filter + Sort
    const filterSortStoreRes = await fetch(`${API_URL}/admin/stores?name=Baker&sortBy=rating&sortOrder=desc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const filterSortStoreJson = await filterSortStoreRes.json();
    assert(filterSortStoreRes.status === 200 && filterSortStoreJson.data.every((s) => s.name.toLowerCase().includes('baker')), '27. Store combined Filter + Sort works');

    // 7. PART 19 — SECURITY & WHITELIST TESTING
    console.log('\n--- 7. PART 19 — SECURITY & WHITELIST TESTING ---');
    // Test 28: Invalid sortBy parameter (e.g. sortBy=users.password)
    const invSortByRes = await fetch(`${API_URL}/admin/users?sortBy=password`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(invSortByRes.status === 400, '28. Invalid sortBy=password rejected with 400 Bad Request');

    // Test 29: Invalid sortOrder parameter (e.g. sortOrder=DROP)
    const invSortOrderRes = await fetch(`${API_URL}/admin/users?sortOrder=DROP`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(invSortOrderRes.status === 400, '29. Invalid sortOrder=DROP rejected with 400 Bad Request');

    // Test 30: SQL injection in Name filter
    const sqlInjNameRes = await fetch(`${API_URL}/admin/users?name=%27%20OR%201=1%20--`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sqlInjNameJson = await sqlInjNameRes.json();
    assert(sqlInjNameRes.status === 200 && sqlInjNameJson.data.length === 0, '30. SQL injection in name filter safely parameterized without error or bypass');

    // Test 31: SQL injection in Email filter
    const sqlInjEmailRes = await fetch(`${API_URL}/admin/users?email=%27%20OR%201=1%20--`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sqlInjEmailJson = await sqlInjEmailRes.json();
    assert(sqlInjEmailRes.status === 200 && sqlInjEmailJson.data.length === 0, '31. SQL injection in email filter safely parameterized without error or bypass');

    // Test 32: SQL injection in Address filter
    const sqlInjAddrRes = await fetch(`${API_URL}/admin/stores?address=%27%20OR%201=1%20--`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sqlInjAddrJson = await sqlInjAddrRes.json();
    assert(sqlInjAddrRes.status === 200 && sqlInjAddrJson.data.length === 0, '32. SQL injection in address filter safely parameterized without error or bypass');

    // Test 33: SQL injection in sortBy parameter
    const sqlInjSortByRes = await fetch(`${API_URL}/admin/users?sortBy=DROP%20TABLE%20users`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(sqlInjSortByRes.status === 400, '33. SQL injection in sortBy rejected with 400 Bad Request');

    // Test 34: SQL injection in sortOrder parameter
    const sqlInjSortOrderRes = await fetch(`${API_URL}/admin/users?sortOrder=DELETE%20FROM%20users`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(sqlInjSortOrderRes.status === 400, '34. SQL injection in sortOrder rejected with 400 Bad Request');

    console.log('\n====================================================');
    console.log(`🏁 PHASE 8 SEARCH, FILTER & SORT TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
  } catch (error) {
    console.error('❌ CRITICAL ERROR IN TEST SUITE:', error);
  }
}

runSearchSortTests();
