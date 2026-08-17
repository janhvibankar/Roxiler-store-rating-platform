const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const API_URL = 'http://localhost:5000/api';

async function runValidationTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE PHASE 9 VALIDATION TEST SUITE');
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

    // 1. NAME VALIDATION
    console.log('--- 1. Testing Name Length Boundaries (20 to 60 characters) ---');
    
    // 19 characters -> reject (400)
    const name19 = 'A'.repeat(19);
    const resName19 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name19,
        email: `val_name19_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
      }),
    });
    assert(resName19.status === 400, '1. Name with 19 characters rejected (HTTP 400)');

    // 20 characters -> accept (201)
    const name20 = 'A'.repeat(20);
    const resName20 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name20,
        email: `val_name20_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
      }),
    });
    assert(resName20.status === 201, '2. Name with 20 characters accepted (HTTP 201)');

    // 60 characters -> accept (201)
    const name60 = 'A'.repeat(60);
    const resName60 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name60,
        email: `val_name60_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
      }),
    });
    assert(resName60.status === 201, '3. Name with 60 characters accepted (HTTP 201)');

    // 61 characters -> reject (400)
    const name61 = 'A'.repeat(61);
    const resName61 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name61,
        email: `val_name61_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
      }),
    });
    assert(resName61.status === 400, '4. Name with 61 characters rejected (HTTP 400)');


    // 2. ADDRESS VALIDATION
    console.log('\n--- 2. Testing Address Boundaries (Max 400 characters) ---');
    
    // 400 characters -> accept (201)
    const addr400 = 'B'.repeat(400);
    const resAddr400 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Address Boundary User Accepted',
        email: `val_addr400_${timestamp}@example.com`,
        address: addr400,
        password: 'ValPass123!',
      }),
    });
    assert(resAddr400.status === 201, '5. Address with 400 characters accepted (HTTP 201)');

    // 401 characters -> reject (400)
    const addr401 = 'B'.repeat(401);
    const resAddr401 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Address Boundary User Rejected',
        email: `val_addr401_${timestamp}@example.com`,
        address: addr401,
        password: 'ValPass123!',
      }),
    });
    assert(resAddr401.status === 400, '6. Address with 401 characters rejected (HTTP 400)');


    // 3. PASSWORD VALIDATION
    console.log('\n--- 3. Testing Password Boundaries & Rules ---');

    // 7 characters -> reject (400)
    const resPass7 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Password Test Seven Chars',
        email: `val_pass7_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'Pass1!a', // 7 chars
      }),
    });
    assert(resPass7.status === 400, '7. Password with 7 characters rejected (HTTP 400)');

    // 8 characters valid -> accept (201)
    const resPass8 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Password Test Eight Chars',
        email: `val_pass8_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'Pass123!', // 8 chars
      }),
    });
    assert(resPass8.status === 201, '8. Valid 8-character password accepted (HTTP 201)');

    // 16 characters valid -> accept (201)
    const resPass16 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Password Test Sixteen Chars',
        email: `val_pass16_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'A1!abcdefghijklm', // 16 chars
      }),
    });
    assert(resPass16.status === 201, '9. Valid 16-character password accepted (HTTP 201)');

    // 17 characters -> reject (400)
    const resPass17 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Password Test Seventeen Ch',
        email: `val_pass17_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'A1!abcdefghijklmn', // 17 chars
      }),
    });
    assert(resPass17.status === 400, '10. Password with 17 characters rejected (HTTP 400)');

    // No uppercase -> reject (400)
    const resNoUpper = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Password Test No Uppercase',
        email: `val_noupper_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'password123!',
      }),
    });
    assert(resNoUpper.status === 400, '11. Password without uppercase letter rejected (HTTP 400)');

    // No special char -> reject (400)
    const resNoSpecial = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Password Test No Special',
        email: `val_nospec_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'Password123',
      }),
    });
    assert(resNoSpecial.status === 400, '12. Password without special character rejected (HTTP 400)');


    // 4. EMAIL VALIDATION & NORMALIZATION
    console.log('\n--- 4. Testing Email Format, Duplication & Normalization ---');

    // Valid standard emails
    const validEmails = [
      `val_email_${timestamp}@example.com`,
      `user.name_${timestamp}@example.com`,
      `user+tag_${timestamp}@example.com`,
    ];
    for (let i = 0; i < validEmails.length; i++) {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Standard Email User ${i + 1} Account`,
          email: validEmails[i],
          address: '100 Validation Boulevard',
          password: 'ValPass123!',
        }),
      });
      assert(res.status === 201, `13.${i + 1} Standard email '${validEmails[i]}' accepted (HTTP 201)`);
    }

    // Invalid email formats -> reject (400)
    const invalidEmails = [
      'invalid',
      'missing@domain',
      '@domain.com',
      'user@',
    ];
    for (let i = 0; i < invalidEmails.length; i++) {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Invalid Email User Account',
          email: invalidEmails[i],
          address: '100 Validation Boulevard',
          password: 'ValPass123!',
        }),
      });
      assert(res.status === 400, `14.${i + 1} Invalid email '${invalidEmails[i]}' rejected (HTTP 400)`);
    }

    // Duplicate email -> reject (409)
    const primaryEmail = `val_dup_${timestamp}@example.com`;
    await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Primary Duplicate Test User',
        email: primaryEmail,
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
      }),
    });
    const dupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Secondary Duplicate Test User',
        email: primaryEmail,
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
      }),
    });
    assert(dupRes.status === 409, '15. Duplicate email signup rejected (HTTP 409)');

    // Email case normalization (User@Example.com vs user@example.com)
    const mixedEmail = `User_Case_${timestamp}@Example.COM`;
    await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mixed Case Email User Account',
        email: mixedEmail,
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
      }),
    });
    const lowerDupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Lower Case Email User Account',
        email: mixedEmail.toLowerCase(),
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
      }),
    });
    assert(lowerDupRes.status === 409, '16. Email normalized to lowercase before duplicate check (HTTP 409)');


    // Setup authentication tokens for Rating, Admin & Store Owner tests
    const normalUserEmail = `rater_user_${timestamp}@example.com`;
    const signupNormalRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rating Tester User Account',
        email: normalUserEmail,
        address: '100 Rater Street',
        password: 'RaterPass123!',
      }),
    });
    const signupNormalJson = await signupNormalRes.json();

    const loginNormalRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalUserEmail, password: 'RaterPass123!' }),
    });
    const loginNormalJson = await loginNormalRes.json();
    const userToken = loginNormalJson.data.token;

    // Login default seeded Admin
    const loginAdminRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@storerating.com', password: 'AdminPass123!' }),
    });
    const loginAdminJson = await loginAdminRes.json();
    const adminToken = loginAdminJson.data.token;

    // Create a Store Owner & Store for rating tests
    const ownerEmail = `store_owner_${timestamp}@example.com`;
    const createOwnerRes = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Validation Store Owner User',
        email: ownerEmail,
        address: '200 Owner Avenue',
        password: 'OwnerPass123!',
        role: 'STORE_OWNER',
      }),
    });
    const createOwnerJson = await createOwnerRes.json();
    const ownerId = createOwnerJson.data.id;

    const createStoreRes = await fetch(`${API_URL}/admin/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Validation Test Store Front',
        email: `store_${timestamp}@example.com`,
        address: '300 Commerce Boulevard',
        owner_id: ownerId,
      }),
    });
    const createStoreJson = await createStoreRes.json();
    const testStoreId = createStoreJson.data.id;


    // 5. RATING VALIDATION
    console.log('\n--- 5. Testing Rating Values (Integer 1 to 5) ---');

    // Rating 1 -> accept (200/201)
    const rate1Res = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ store_id: testStoreId, rating: 1 }),
    });
    assert(rate1Res.status === 200 || rate1Res.status === 201, '17. Rating 1 accepted (HTTP 200/201)');

    // Rating 5 -> accept (200/201)
    const rate5Res = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ store_id: testStoreId, rating: 5 }),
    });
    assert(rate5Res.status === 200 || rate5Res.status === 201, '18. Rating 5 accepted (HTTP 200/201)');

    // Rating 0 -> reject (400)
    const rate0Res = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ store_id: testStoreId, rating: 0 }),
    });
    assert(rate0Res.status === 400, '19. Rating 0 rejected (HTTP 400)');

    // Rating 6 -> reject (400)
    const rate6Res = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ store_id: testStoreId, rating: 6 }),
    });
    assert(rate6Res.status === 400, '20. Rating 6 rejected (HTTP 400)');

    // Negative rating (-1) -> reject (400)
    const rateNegRes = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ store_id: testStoreId, rating: -1 }),
    });
    assert(rateNegRes.status === 400, '21. Negative rating -1 rejected (HTTP 400)');

    // Decimal rating (1.5) -> reject (400)
    const rateDecRes = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ store_id: testStoreId, rating: 1.5 }),
    });
    assert(rateDecRes.status === 400, '22. Decimal rating 1.5 rejected (HTTP 400)');

    // Non-numeric rating ("abc") -> reject (400)
    const rateStrRes = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ store_id: testStoreId, rating: 'abc' }),
    });
    assert(rateStrRes.status === 400, '23. Non-numeric rating "abc" rejected (HTTP 400)');


    // 6. REQUIRED FIELDS VALIDATION
    console.log('\n--- 6. Testing Required Field Absences ---');

    // Missing name
    const resNoName = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `val_noname_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
      }),
    });
    assert(resNoName.status === 400, '24. Missing name field rejected (HTTP 400)');

    // Missing email
    const resNoEmail = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name Tester User Account',
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
      }),
    });
    assert(resNoEmail.status === 400, '25. Missing email field rejected (HTTP 400)');

    // Missing address
    const resNoAddr = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name Tester User Account',
        email: `val_noaddr_${timestamp}@example.com`,
        password: 'ValPass123!',
      }),
    });
    assert(resNoAddr.status === 400, '26. Missing address field rejected (HTTP 400)');

    // Missing password
    const resNoPass = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name Tester User Account',
        email: `val_nopass_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
      }),
    });
    assert(resNoPass.status === 400, '27. Missing password field rejected (HTTP 400)');


    // 7. SECURITY & AUTHORIZATION VALIDATION
    console.log('\n--- 7. Testing Privilege Escalation & Security Rules ---');

    // Public signup cannot create ADMIN
    const pubAdminRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Privilege Escalation User Admin',
        email: `pub_admin_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
        role: 'ADMIN',
      }),
    });
    const pubAdminJson = await pubAdminRes.json();
    assert(pubAdminRes.status === 201 && pubAdminJson.data.role === 'USER', '28. Public signup cannot create ADMIN (forced role = USER)');

    // Public signup cannot create STORE_OWNER
    const pubOwnerRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Privilege Escalation User Owner',
        email: `pub_owner_${timestamp}@example.com`,
        address: '100 Validation Boulevard',
        password: 'ValPass123!',
        role: 'STORE_OWNER',
      }),
    });
    const pubOwnerJson = await pubOwnerRes.json();
    assert(pubOwnerRes.status === 201 && pubOwnerJson.data.role === 'USER', '29. Public signup cannot create STORE_OWNER (forced role = USER)');

    // Unauthorized password change rejected (401)
    const unauthPassRes = await fetch(`${API_URL}/auth/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: 'RaterPass123!', newPassword: 'NewValidPass123!' }),
    });
    assert(unauthPassRes.status === 401, '30. Unauthorized password change rejected (HTTP 401)');

    // Invalid current password rejected (400)
    const wrongCurrentPassRes = await fetch(`${API_URL}/auth/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ currentPassword: 'WrongPass999!', newPassword: 'NewValidPass123!' }),
    });
    assert(wrongCurrentPassRes.status === 400, '31. Password change with wrong current password rejected (HTTP 400)');

    // Rating cannot be submitted for another user (user_id in body ignored, uses req.user.userId)
    const spoofUserRatingRes = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ store_id: testStoreId, rating: 4, user_id: 9999 }),
    });
    const spoofUserRatingJson = await spoofUserRatingRes.json();
    assert(spoofUserRatingRes.status === 200 || spoofUserRatingRes.status === 201, '32. Rating submission succeeds ignoring user_id in body');
    assert(spoofUserRatingJson.data.user_id === signupNormalJson.data.id, '32b. Rating user_id strictly taken from JWT req.user.userId (not body)');

    // Invalid store owner rejected when creating store (Normal USER or non-existent owner)
    const invalidOwnerStoreRes = await fetch(`${API_URL}/admin/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Invalid Owner Store Front Test',
        email: `invalid_owner_store_${timestamp}@example.com`,
        address: '500 Tech Road',
        owner_id: signupNormalJson.data.id, // Normal USER id, not STORE_OWNER
      }),
    });
    assert(invalidOwnerStoreRes.status === 400, '33. Store creation with non-STORE_OWNER user rejected (HTTP 400)');

    // USER cannot become store owner through request payload on public signup
    const userRoleInDb = await db.query('SELECT role FROM users WHERE id = ?', [signupNormalJson.data.id]);
    assert(userRoleInDb[0].role === 'USER', '34. USER role strictly preserved in database');


    console.log('\n====================================================');
    console.log(`🏁 VALIDATION TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error during validation test execution:', err);
    process.exit(1);
  }
}

runValidationTests();
