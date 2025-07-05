const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const db = require("../db");

class User {
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    try {
      await db.query(sql);
      console.log('Users table created or already exists');
    } catch (error) {
      console.error('Error creating users table:', error);
      throw error;
    }
  }

  static async findOne({ email }) {
    const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    try {
      const [rows] = await db.query(sql, [email]);
      if (rows.length === 0) return null;
      return {
        ...rows[0],
        firstName: rows[0].first_name,
        lastName: rows[0].last_name,
        generateAuthToken: function() {
          return jwt.sign(
            { 
              _id: this.id, 
              role: this.role, 
              name: `${this.first_name} ${this.last_name}` 
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
          );
        }
      };
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  static async create(userData) {
    const sql = `
      INSERT INTO users (first_name, last_name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    try {
      const [result] = await db.query(sql, [
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.password,
        'customer'
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

const validateUser = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
  });
  return schema.validate(data);
};

// Create users table when the model is loaded
User.createTable().catch(console.error);

module.exports = { User, validateUser };