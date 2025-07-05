const db = require('../db');

class Reservation {
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        date DATE NOT NULL,
        time TIME NOT NULL,
        party_size INT NOT NULL,
        special_requests TEXT,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'cancelled-by-customer', 'cancelled-by-restaurant') DEFAULT 'pending',
        review_rating INT DEFAULT NULL,
        review_comment TEXT DEFAULT NULL,
        review_date TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await db.query(sql);
      console.log('Reservations table created or already exists');
    } catch (error) {
      console.error('Error creating reservations table:', error);
      throw error;
    }
  }

  static async create(reservationData) {
    const sql = `
      INSERT INTO reservations 
      (user_id, customer_name, phone, email, date, time, party_size, special_requests, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await db.query(sql, [
        reservationData.userId,
        reservationData.customerName,
        reservationData.phone || null,
        reservationData.email || null,
        reservationData.date,
        reservationData.time,
        reservationData.partySize,
        reservationData.special_requests || null,
        reservationData.status || 'pending'
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    const sql = `
      SELECT *
      FROM reservations
      WHERE user_id = ?
      ORDER BY date DESC, time DESC
    `;
    try {
      const [rows] = await db.query(sql, [userId]);
      // Transform the review data for each row
      return rows.map(row => ({
        ...row,
        review: row.review_rating ? {
          rating: row.review_rating,
          comment: row.review_comment,
          date: row.review_date
        } : null
      }));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  }

  static async updateStatus(reservationId, status) {
    const sql = 'UPDATE reservations SET status = ? WHERE id = ?';
    try {
      const [result] = await db.query(sql, [status, reservationId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }
  }

  static async update(reservationId, updateData) {
    const sql = `
      UPDATE reservations 
      SET date = ?, time = ?, party_size = ?, special_requests = ?
      WHERE id = ?
    `;
    try {
      const [result] = await db.query(sql, [
        updateData.date,
        updateData.time,
        updateData.partySize,
        updateData.specialRequests,
        reservationId
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  static async delete(reservationId) {
    const sql = 'DELETE FROM reservations WHERE id = ?';
    try {
      const [result] = await db.query(sql, [reservationId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  }

  static async findByEmail(email, date, time) {
    const sql = `
      SELECT * FROM reservations
      WHERE email = ? AND date = ? AND time = ?
    `;

    try {
      const [rows] = await db.query(sql, [email, date, time]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding reservation by email:', error);
      throw error;
    }
  }

  // Admin methods
  static async getAll(filters = {}) {
    let sql = `
      SELECT r.*,
             CASE
               WHEN r.user_id = 'botpress' THEN 'Botpress'
               ELSE 'Website'
             END as source
      FROM reservations r
      WHERE 1=1
    `;
    const params = [];

    // Add filters
    if (filters.status) {
      sql += ' AND r.status = ?';
      params.push(filters.status);
    }
    if (filters.date) {
      sql += ' AND r.date = ?';
      params.push(filters.date);
    }
    if (filters.email) {
      sql += ' AND r.email LIKE ?';
      params.push(`%${filters.email}%`);
    }
    if (filters.customerName) {
      sql += ' AND r.customer_name LIKE ?';
      params.push(`%${filters.customerName}%`);
    }

    sql += ' ORDER BY r.date DESC, r.time DESC';

    try {
      const [rows] = await db.query(sql, params);
      return rows;
    } catch (error) {
      console.error('Error fetching all reservations:', error);
      throw error;
    }
  }

  static async getById(id) {
    const sql = 'SELECT * FROM reservations WHERE id = ?';
    try {
      const [rows] = await db.query(sql, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error fetching reservation by ID:', error);
      throw error;
    }
  }

  static async updateAdmin(id, updateData) {
    let sql = `
      UPDATE reservations
      SET customer_name = ?, phone = ?, email = ?, date = ?, time = ?,
          party_size = ?, special_requests = ?, status = ?
    `;
    let params = [
      updateData.customerName,
      updateData.phone || null,
      updateData.email || null,
      updateData.date,
      updateData.time,
      updateData.partySize,
      updateData.specialRequests || null,
      updateData.status
    ];

    // If userId is provided, update it too
    if (updateData.userId) {
      sql = `
        UPDATE reservations
        SET user_id = ?, customer_name = ?, phone = ?, email = ?, date = ?, time = ?,
            party_size = ?, special_requests = ?, status = ?
      `;
      params = [
        updateData.userId,
        updateData.customerName,
        updateData.phone || null,
        updateData.email || null,
        updateData.date,
        updateData.time,
        updateData.partySize,
        updateData.specialRequests || null,
        updateData.status
      ];
    }

    sql += ' WHERE id = ?';
    params.push(id);

    try {
      const [result] = await db.query(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  static async getStats() {
    const sql = `
      SELECT
        status,
        COUNT(*) as count,
        DATE(date) as reservation_date
      FROM reservations
      WHERE date >= CURDATE() - INTERVAL 30 DAY
      GROUP BY status, DATE(date)
      ORDER BY reservation_date DESC
    `;
    try {
      const [rows] = await db.query(sql);
      return rows;
    } catch (error) {
      console.error('Error fetching reservation stats:', error);
      throw error;
    }
  }

  static async addReview(id, reviewData) {
    const sql = `
      UPDATE reservations
      SET review_rating = ?, review_comment = ?, review_date = NOW()
      WHERE id = ?
    `;
    try {
      const [result] = await db.query(sql, [
        reviewData.rating,
        reviewData.comment,
        id
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
}

module.exports = Reservation; 

