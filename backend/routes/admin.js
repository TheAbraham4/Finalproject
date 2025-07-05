const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { syncUserData } = require('../utils/syncUsers');
const botpressUtils = require('../utils/botpressClient');
const Reservation = require('../models/reservation');
const BotpressReservation = require('../models/botpressReservation');
const { User } = require('../models/userMongo');
const bcrypt = require('bcrypt');
const db = require('../db');

// Admin-only endpoint to sync user data
router.post('/sync-users', [auth, admin], async (req, res) => {
  try {
    const result = await syncUserData();
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ message: 'Sync failed', error: result.error });
    }
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Sync reservations from MySQL to Botpress
router.post('/sync-to-botpress', [auth, admin], async (req, res) => {
  try {
    // Get all reservations from MySQL
    const [reservations] = await db.query('SELECT * FROM reservations WHERE email IS NOT NULL');
    
    // Sync to Botpress
    const result = await botpressUtils.syncReservationsToBot(reservations);
    
    if (result.success) {
      res.status(200).json({ 
        message: `Successfully synced ${result.synced} reservations to Botpress` 
      });
    } else {
      res.status(500).json({ 
        message: 'Sync failed', 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error in sync to Botpress endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Sync reservations from Botpress to MySQL
router.post('/sync-from-botpress', [auth, admin], async (req, res) => {
  try {
    const result = await botpressUtils.syncReservationsFromBot();
    
    if (result.success) {
      res.status(200).json({ 
        message: `Successfully synced ${result.synced} reservations from Botpress` 
      });
    } else {
      res.status(500).json({ 
        message: 'Sync failed', 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error in sync from Botpress endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============ RESERVATION MANAGEMENT ROUTES ============

// Get all reservations with filtering
router.get('/reservations', [auth, admin], async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      date: req.query.date,
      email: req.query.email,
      customerName: req.query.customerName
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });

    const reservations = await Reservation.getAll(filters);
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Get reservation statistics
router.get('/reservations/stats', [auth, admin], async (req, res) => {
  try {
    const stats = await Reservation.getStats();

    // Process stats for dashboard
    const statusCounts = {};
    const dailyStats = {};

    stats.forEach(stat => {
      // Count by status
      if (!statusCounts[stat.status]) {
        statusCounts[stat.status] = 0;
      }
      statusCounts[stat.status] += stat.count;

      // Count by date
      const dateStr = stat.reservation_date.toISOString().split('T')[0];
      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {};
      }
      dailyStats[dateStr][stat.status] = stat.count;
    });

    res.json({
      statusCounts,
      dailyStats,
      rawStats: stats
    });
  } catch (error) {
    console.error('Error fetching reservation stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get single reservation by ID
router.get('/reservations/:id', [auth, admin], async (req, res) => {
  try {
    const reservation = await Reservation.getById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ message: 'Error fetching reservation' });
  }
});

// Update reservation
router.put('/reservations/:id', [auth, admin], async (req, res) => {
  try {
    const updateData = {
      customerName: req.body.customerName,
      phone: req.body.phone,
      email: req.body.email,
      date: req.body.date,
      time: req.body.time,
      partySize: req.body.partySize,
      specialRequests: req.body.specialRequests,
      status: req.body.status
    };

    // If email is provided, try to find the user and update user_id
    if (req.body.email) {
      try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
          updateData.userId = user._id.toString();
        }
      } catch (error) {
        console.log('User not found for email:', req.body.email);
      }
    }

    const updated = await Reservation.updateAdmin(req.params.id, updateData);

    if (updated) {
      res.json({ message: 'Reservation updated successfully' });
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Error updating reservation' });
  }
});

// Update reservation status only
router.patch('/reservations/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'cancelled-by-customer', 'cancelled-by-restaurant'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await Reservation.updateStatus(req.params.id, status);

    if (updated) {
      res.json({ message: 'Reservation status updated successfully' });
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ message: 'Error updating reservation status' });
  }
});

// Delete reservation
router.delete('/reservations/:id', [auth, admin], async (req, res) => {
  try {
    const deleted = await Reservation.delete(req.params.id);

    if (deleted) {
      res.json({ message: 'Reservation deleted successfully' });
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Error deleting reservation' });
  }
});

// Create admin user (one-time setup)
router.post('/create-admin', async (req, res) => {
  try {
    const { firstName, lastName, email, password, adminKey } = req.body;

    // Check admin key (you should set this in your environment)
    if (adminKey !== process.env.ADMIN_CREATION_KEY) {
      return res.status(403).json({ message: 'Invalid admin creation key' });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Error creating admin user' });
  }
});

module.exports = router;

