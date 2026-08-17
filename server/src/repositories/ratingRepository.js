const db = require('../config/db');

class RatingRepository {
  async createRating({ user_id, store_id, rating }) {
    const sql = `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`;
    const result = await db.query(sql, [user_id, store_id, rating]);
    return this.findRatingById(result.insertId);
  }

  async updateRating(user_id, store_id, rating) {
    const sql = `UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?`;
    await db.query(sql, [rating, user_id, store_id]);
    return this.findRatingByUserAndStore(user_id, store_id);
  }

  async upsertRating({ user_id, store_id, rating }) {
    const sql = `
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = ?, updated_at = CURRENT_TIMESTAMP
    `;
    await db.query(sql, [user_id, store_id, rating, rating]);
    return this.findRatingByUserAndStore(user_id, store_id);
  }

  async findRatingById(id) {
    const sql = `SELECT * FROM ratings WHERE id = ?`;
    const ratings = await db.query(sql, [id]);
    return ratings[0] || null;
  }

  async findRatingByUserAndStore(user_id, store_id) {
    const sql = `SELECT * FROM ratings WHERE user_id = ? AND store_id = ?`;
    const ratings = await db.query(sql, [user_id, store_id]);
    return ratings[0] || null;
  }

  async getRatingsForStore(store_id) {
    const sql = `
      SELECT r.id, r.user_id, r.store_id, r.rating, r.created_at, r.updated_at, u.name AS user_name, u.email AS user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.updated_at DESC
    `;
    return db.query(sql, [store_id]);
  }

  async getRatingUsersForStore(storeId, filters = {}) {
    const { sortBy = 'updated_at', sortOrder = 'desc' } = filters;

    const columnMap = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      rating: 'r.rating',
      created_at: 'r.created_at',
      updated_at: 'r.updated_at',
    };

    const sortColumn = columnMap[sortBy] || 'r.updated_at';
    const orderDirection = (sortOrder || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const sql = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.address,
        r.rating,
        r.created_at,
        r.updated_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE r.store_id = ?
      ORDER BY ${sortColumn} ${orderDirection}
    `;
    const rows = await db.query(sql, [storeId]);
    return rows.map((r) => ({
      ...r,
      rating: parseInt(r.rating, 10),
    }));
  }

  async getRatings() {
    const sql = `SELECT * FROM ratings ORDER BY id ASC`;
    return db.query(sql);
  }
}

module.exports = new RatingRepository();
