const { User } = require('../models/userMongo');
const db = require('../db');

/**
 * Syncs user data from MongoDB to MySQL reservations
 * Updates customer_name in reservations table with first name from MongoDB
 */
async function syncUserData() {
  try {
    console.log('Starting user data sync...');
    
    // Get all users from MongoDB
    const mongoUsers = await User.find({});
    
    for (const user of mongoUsers) {
      // Update all reservations for this user in MySQL
      const sql = `
        UPDATE reservations 
        SET customer_name = ? 
        WHERE user_id = ?
      `;
      
      await db.query(sql, [user.firstName, user._id.toString()]);
      console.log(`Updated reservations for user: ${user._id} (${user.firstName})`);
    }
    
    console.log('User data sync completed successfully');
    return { success: true, message: 'Sync completed' };
  } catch (error) {
    console.error('Error syncing user data:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { syncUserData };