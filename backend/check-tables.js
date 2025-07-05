const mysql = require('mysql2');
require('dotenv').config();

async function checkTables() {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'abraham_restaurant'
  });

  const promiseConnection = connection.promise();

  try {
    console.log('🔍 Checking database tables...');
    
    // Check if tables exist
    const [tables] = await promiseConnection.query("SHOW TABLES");
    console.log('📋 Existing tables:', tables);
    
    // Check reservations table structure
    try {
      const [reservationsDesc] = await promiseConnection.query("DESCRIBE reservations");
      console.log('📋 Reservations table structure:', reservationsDesc);
    } catch (err) {
      console.log('❌ Reservations table does not exist');
    }
    
    // Check botpress_reservations table structure
    try {
      const [botpressDesc] = await promiseConnection.query("DESCRIBE botpress_reservations");
      console.log('📋 Botpress_reservations table structure:', botpressDesc);
    } catch (err) {
      console.log('❌ Botpress_reservations table does not exist');
    }
    
    // Check foreign key constraints
    try {
      const [constraints] = await promiseConnection.query(`
        SELECT 
          CONSTRAINT_NAME,
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE REFERENCED_TABLE_SCHEMA = 'abraham_restaurant'
      `);
      console.log('🔗 Foreign key constraints:', constraints);
    } catch (err) {
      console.log('❌ Error checking constraints:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    connection.end();
  }
}

checkTables();
