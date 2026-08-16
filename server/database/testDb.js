const db = require('../src/config/db');
const userRepository = require('../src/repositories/userRepository');
const storeRepository = require('../src/repositories/storeRepository');
const ratingRepository = require('../src/repositories/ratingRepository');

async function runDatabaseTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE PHASE 2 MYSQL TEST SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failedCount++;
    }
  }

  try {
    // Test 1: Fetch initial seeded users
    console.log('--- 1. Testing User Repository ---');
    const initialUsers = await userRepository.getUsers();
    assert(initialUsers.length >= 3, `Seeded users retrieved (count: ${initialUsers.length})`);

    const adminUser = await userRepository.findUserByEmail('admin@storerating.com');
    assert(adminUser && adminUser.role === 'ADMIN', 'Seeded ADMIN user retrieved correctly');

    const newUserEmail = `testuser_${Date.now()}@example.com`;
    const createdUser = await userRepository.createUser({
      name: 'Test Customer',
      email: newUserEmail,
      password: 'TestPassword123!',
      address: '456 Test Street',
      role: 'USER',
    });
    assert(createdUser && createdUser.email === newUserEmail, 'Created new user successfully');

    // Test 2: Role constraint check
    console.log('\n--- 2. Testing Role Constraint Enforcement ---');
    try {
      await db.query(
        `INSERT INTO users (name, email, password, address, role) VALUES ('Bad Role', 'badrole@example.com', 'pass', 'addr', 'INVALID_ROLE')`
      );
      assert(false, 'Invalid role insertion should have failed but passed!');
    } catch (err) {
      assert(true, `Invalid role rejected as expected (${err.message})`);
    }

    // Test 3: Store Repository & Foreign Keys
    console.log('\n--- 3. Testing Store Repository & Foreign Keys ---');
    const initialStores = await storeRepository.getStoresWithAverageRating();
    assert(initialStores.length >= 1, `Seeded stores retrieved (count: ${initialStores.length})`);

    const newStore = await storeRepository.createStore({
      name: `Test Cafe ${Date.now()}`,
      email: 'cafe@test.com',
      address: '789 Coffee Lane',
      owner_id: 3, // John Store Owner
    });
    assert(newStore && newStore.owner_id === 3, 'Created new store with valid owner_id');

    try {
      await storeRepository.createStore({
        name: 'Ghost Store',
        email: 'ghost@test.com',
        address: 'Nowhere',
        owner_id: 99999, // Non-existent user
      });
      assert(false, 'Store creation with non-existent owner_id should fail!');
    } catch (err) {
      assert(true, `Invalid owner_id foreign key rejected as expected (${err.message})`);
    }

    // Test 4: Rating Repository & Unique Constraint
    console.log('\n--- 4. Testing Rating Repository & Unique (user_id, store_id) Constraint ---');

    // User id 2 rates store id 1 (seeded rating is 5)
    const existingRating = await ratingRepository.findRatingByUserAndStore(2, 1);
    assert(existingRating !== null, 'Found existing user rating for store');

    // Attempting raw INSERT for duplicate (user_id 2, store_id 1)
    try {
      await db.query(`INSERT INTO ratings (user_id, store_id, rating) VALUES (2, 1, 3)`);
      assert(false, 'Duplicate (user_id, store_id) raw insert should have failed!');
    } catch (err) {
      assert(true, `Duplicate rating rejected by unique constraint (${err.code || err.message})`);
    }

    // Test 5: Rating update via upsert
    console.log('\n--- 5. Testing Rating Update ---');
    const updatedRating = await ratingRepository.upsertRating({
      user_id: 2,
      store_id: 1,
      rating: 4,
    });
    assert(updatedRating && updatedRating.rating === 4, 'Successfully modified existing rating to 4');

    // Test 6: Rating range check (1 to 5)
    console.log('\n--- 6. Testing Rating Value Range (1 to 5) ---');
    try {
      await db.query(`INSERT INTO ratings (user_id, store_id, rating) VALUES (1, ${newStore.id}, 10)`);
      assert(false, 'Rating value 10 should have failed CHECK constraint!');
    } catch (err) {
      assert(true, `Out-of-range rating rejected as expected (${err.message})`);
    }

    // Test 7: Average Rating Calculation AVG(rating)
    console.log('\n--- 7. Testing SQL AVG(rating) Aggregation ---');
    // Clear extra ratings on store 1 except user 2's updated rating (4)
    await db.query(`DELETE FROM ratings WHERE store_id = 1 AND user_id != 2`);
    await ratingRepository.createRating({
      user_id: createdUser.id,
      store_id: 1,
      rating: 2,
    });

    const storeWithAvg = await storeRepository.findStoreById(1);
    // Ratings for store 1: user 2 -> 4, createdUser -> 2. Expected AVG = 3.00
    assert(
      storeWithAvg && parseFloat(storeWithAvg.rating) === 3.00,
      `Calculated store average rating correctly: expected 3.00, got ${storeWithAvg.rating}`
    );

    console.log('\n====================================================');
    console.log(`🏁 TEST SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Fatal error during test execution:', error);
  } finally {
    process.exit(failedCount > 0 ? 1 : 0);
  }
}

if (require.main === module) {
  runDatabaseTests();
}
