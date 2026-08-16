const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const dbName = process.env.DB_NAME || 'store_rating_platform';

async function initDatabase() {
  let connection;
  try {
    console.log(`Connecting to MySQL server at ${dbConfig.host}:${dbConfig.port}...`);
    connection = await mysql.createConnection(dbConfig);

    console.log(`Ensuring database "${dbName}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await connection.query(sql);
      }
    }

    console.log('Seeding initial users with bcrypt hashed passwords...');
    const adminPassHash = await bcrypt.hash('AdminPass123!', 10);
    const userPassHash = await bcrypt.hash('UserPass123!', 10);
    const ownerPassHash = await bcrypt.hash('OwnerPass123!', 10);

    const seedUsersSql = `
      INSERT INTO users (id, name, email, password, address, role) VALUES
      (1, 'System Administrator', 'admin@storerating.com', ?, '100 Admin Plaza, Suite 1', 'ADMIN'),
      (2, 'Jane Customer', 'user@storerating.com', ?, '200 Main Street, Apt 4B', 'USER'),
      (3, 'John Store Owner', 'owner@storerating.com', ?, '300 Commerce Boulevard', 'STORE_OWNER')
      ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password), role=VALUES(role);
    `;
    await connection.query(seedUsersSql, [adminPassHash, userPassHash, ownerPassHash]);

    const seedStoresSql = `
      INSERT INTO stores (id, name, email, address, owner_id) VALUES
      (1, 'Apex Electronics Store', 'apex@stores.com', '400 Tech Park, Building A', 3)
      ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), address=VALUES(address), owner_id=VALUES(owner_id);
    `;
    await connection.query(seedStoresSql);

    const seedRatingsSql = `
      INSERT INTO ratings (id, user_id, store_id, rating) VALUES
      (1, 2, 1, 5)
      ON DUPLICATE KEY UPDATE rating=VALUES(rating);
    `;
    await connection.query(seedRatingsSql);

    console.log('✅ Database initialization, migrations, and bcrypt seed data completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initDatabase;
