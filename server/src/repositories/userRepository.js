const db = require('../config/db');

class UserRepository {
  async createUser({ name, email, password, address, role = 'USER' }) {
    const sql = `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`;
    const result = await db.query(sql, [name, email, password, address, role]);
    return this.findUserById(result.insertId);
  }

  async findUserById(id) {
    const sql = `SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?`;
    const users = await db.query(sql, [id]);
    return users[0] || null;
  }

  async findUserByEmail(email) {
    const sql = `SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE email = ?`;
    const users = await db.query(sql, [email]);
    return users[0] || null;
  }

  async findUserWithPasswordByEmail(email) {
    const sql = `SELECT id, name, email, password, address, role, created_at, updated_at FROM users WHERE email = ?`;
    const users = await db.query(sql, [email]);
    return users[0] || null;
  }

  async findUserWithPasswordById(id) {
    const sql = `SELECT id, name, email, password, address, role, created_at, updated_at FROM users WHERE id = ?`;
    const users = await db.query(sql, [id]);
    return users[0] || null;
  }

  async updatePassword(id, newHashedPassword) {
    const sql = `UPDATE users SET password = ? WHERE id = ?`;
    await db.query(sql, [newHashedPassword, id]);
    return this.findUserById(id);
  }

  async getUsers(filters = {}) {
    let sql = `SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE 1=1`;
    const params = [];

    if (filters.name) {
      sql += ` AND name LIKE ?`;
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      sql += ` AND email LIKE ?`;
      params.push(`%${filters.email}%`);
    }

    if (filters.address) {
      sql += ` AND address LIKE ?`;
      params.push(`%${filters.address}%`);
    }

    if (filters.role) {
      sql += ` AND role = ?`;
      params.push(filters.role);
    }

    sql += ` ORDER BY id ASC`;
    return db.query(sql, params);
  }

  async getAdminUsersListing(filters = {}) {
    let sql = `SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE role IN ('USER', 'ADMIN')`;
    const params = [];

    if (filters.name) {
      sql += ` AND name LIKE ?`;
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      sql += ` AND email LIKE ?`;
      params.push(`%${filters.email}%`);
    }

    if (filters.address) {
      sql += ` AND address LIKE ?`;
      params.push(`%${filters.address}%`);
    }

    if (filters.role) {
      sql += ` AND role = ?`;
      params.push(filters.role);
    }

    sql += ` ORDER BY id ASC`;
    return db.query(sql, params);
  }

  async getStoreOwnerUsers() {
    const sql = `SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE role = 'STORE_OWNER' ORDER BY name ASC`;
    return db.query(sql);
  }
}

module.exports = new UserRepository();
