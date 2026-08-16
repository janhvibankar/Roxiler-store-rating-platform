const db = require('../config/db');

class StoreRepository {
  async createStore({ name, email, address, owner_id }) {
    const sql = `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`;
    const result = await db.query(sql, [name, email, address, owner_id]);
    return this.findStoreById(result.insertId);
  }

  async findStoreById(id) {
    const sql = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id, 
        ROUND(AVG(r.rating), 2) AS rating,
        COUNT(r.id) AS total_ratings,
        s.created_at, 
        s.updated_at
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id
    `;
    const stores = await db.query(sql, [id]);
    return stores[0] || null;
  }

  async findStoreByOwnerId(ownerId) {
    const stores = await this.findStoresByOwnerId(ownerId);
    return stores[0] || null;
  }

  async findStoresByOwnerId(ownerId) {
    const sql = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id, 
        ROUND(AVG(r.rating), 2) AS rating,
        ROUND(AVG(r.rating), 2) AS averageRating,
        COUNT(r.id) AS total_ratings,
        COUNT(r.id) AS totalRatings,
        s.created_at, 
        s.updated_at
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
      ORDER BY s.id ASC
    `;
    const stores = await db.query(sql, [ownerId]);
    return stores.map((s) => ({
      ...s,
      storeId: s.id,
      storeName: s.name,
      rating: s.rating !== null && s.rating !== undefined ? parseFloat(s.rating) : null,
      averageRating: s.averageRating !== null && s.averageRating !== undefined ? parseFloat(s.averageRating) : null,
      totalRatings: parseInt(s.totalRatings || 0, 10),
    }));
  }

  async getStores() {
    const sql = `SELECT * FROM stores ORDER BY id ASC`;
    return db.query(sql);
  }

  async getStoresWithAverageRating(filters = {}) {
    let sql = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id, 
        ROUND(AVG(r.rating), 2) AS rating,
        COUNT(r.id) AS total_ratings,
        s.created_at, 
        s.updated_at
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.name) {
      sql += ` AND s.name LIKE ?`;
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      sql += ` AND s.email LIKE ?`;
      params.push(`%${filters.email}%`);
    }

    if (filters.address) {
      sql += ` AND s.address LIKE ?`;
      params.push(`%${filters.address}%`);
    }

    sql += ` GROUP BY s.id`;

    const STORE_ADMIN_SORT_MAP = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      createdAt: 's.created_at',
      rating: 'rating',
    };

    const sortDir = (filters.sortOrder || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    if (filters.sortBy === 'rating') {
      sql += ` ORDER BY AVG(r.rating) IS NULL ASC, AVG(r.rating) ${sortDir}, s.id ASC`;
    } else if (filters.sortBy && STORE_ADMIN_SORT_MAP[filters.sortBy]) {
      sql += ` ORDER BY ${STORE_ADMIN_SORT_MAP[filters.sortBy]} ${sortDir}, s.id ASC`;
    } else {
      sql += ` ORDER BY s.id ASC`;
    }

    return db.query(sql, params);
  }

  async getStoresForUser({ name, address, userId, sortBy, sortOrder } = {}) {
    const validUserId = userId !== undefined && userId !== null ? userId : null;
    let sql = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id, 
        ROUND(AVG(r.rating), 2) AS overallRating,
        COUNT(r.id) AS totalRatings,
        (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ? LIMIT 1) AS userRating,
        s.created_at, 
        s.updated_at
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id IS NOT NULL
    `;
    const params = [validUserId];

    if (name) {
      sql += ` AND s.name LIKE ?`;
      params.push(`%${name}%`);
    }

    if (address) {
      sql += ` AND s.address LIKE ?`;
      params.push(`%${address}%`);
    }

    sql += ` GROUP BY s.id`;

    const STORE_USER_SORT_MAP = {
      name: 's.name',
      address: 's.address',
      overallRating: 'overallRating',
    };

    const sortDir = (sortOrder || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    if (sortBy === 'overallRating') {
      sql += ` ORDER BY AVG(r.rating) IS NULL ASC, AVG(r.rating) ${sortDir}, s.id ASC`;
    } else if (sortBy && STORE_USER_SORT_MAP[sortBy]) {
      sql += ` ORDER BY ${STORE_USER_SORT_MAP[sortBy]} ${sortDir}, s.id ASC`;
    } else {
      sql += ` ORDER BY s.id ASC`;
    }

    const rows = await db.query(sql, params);

    return rows.map((row) => ({
      ...row,
      overallRating: row.overallRating !== null && row.overallRating !== undefined ? parseFloat(row.overallRating) : null,
      userRating: row.userRating !== null && row.userRating !== undefined ? parseInt(row.userRating, 10) : null,
    }));
  }
}

module.exports = new StoreRepository();
