const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'abraham_restaurant',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert pool query into promises
const promisePool = pool.promise();

module.exports = promisePool; 