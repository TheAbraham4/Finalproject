const db = require('../db');

class BotpressReservation {
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS botpress_reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        datetime DATETIME NOT NULL,
        party_size INT NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'cancelled-by-customer', 'cancelled-by-restaurant') DEFAULT 'pending',
        reservation_id INT,
        conf_number INT, 
        source VARCHAR(50) DEFAULT 'botpress',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
      )
    `;
    
    try {
      await db.query(sql);
      console.log('Botpress reservations table created or already exists');
    } catch (error) {
      console.error('Error creating botpress_reservations table:', error);
      throw error;
    }
  }

  static async create(reservationData) {
    const sql = `
      INSERT INTO botpress_reservations 
      (email, datetime, party_size, reservation_id, conf_number, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await db.query(sql, [
        reservationData.email,
        reservationData.datetime,
        reservationData.partySize,
        reservationData.reservationId || null,
        reservationData.conf_number || null, 
        reservationData.status || 'pending'
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating botpress reservation:', error);
      throw error;
    }
  }

  static async findByEmail(email, datetime) {
    const sql = `
      SELECT * FROM botpress_reservations 
      WHERE email = ? AND datetime = ?
    `;
    
    try {
      const [rows] = await db.query(sql, [email, datetime]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding botpress reservation by email:', error);
      throw error;
    }
  }

  static async getAll() {
    const sql = `
      SELECT br.*, r.customer_name, r.phone, r.special_requests
      FROM botpress_reservations br
      LEFT JOIN reservations r ON br.reservation_id = r.id
      ORDER BY br.datetime DESC
    `;
    
    try {
      const [rows] = await db.query(sql);
      return rows;
    } catch (error) {
      console.error('Error getting all botpress reservations:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    const sql = `
      UPDATE botpress_reservations 
      SET datetime = ?, party_size = ?, status = ?, conf_number = ?
      WHERE id = ?
    `;
    try {
      const [result] = await db.query(sql, [
        updateData.datetime,
        updateData.partySize,
        updateData.status,
        updateData.conf_number || null, // ✅ Optional support
        id
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating botpress reservation:', error);
      throw error;
    }
  }

  static async delete(id) {
    const sql = 'DELETE FROM botpress_reservations WHERE id = ?';
    try {
      const [result] = await db.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting botpress reservation:', error);
      throw error;
    }
  }
}

module.exports = BotpressReservation;
