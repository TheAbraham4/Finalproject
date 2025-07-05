const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservation');
const { User } = require('../models/userMongo');
const auth = require('../middleware/auth');

// Create a new reservation
router.post('/', auth, async (req, res) => {
  try {
    // Fetch user from MongoDB to get the firstName
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const reservationData = {
      userId: req.user._id,
      customerName: user.firstName, // Use firstName from MongoDB
      email: user.email,
      phone: req.body.phone || '',
      date: req.body.date,
      time: req.body.time,
      partySize: req.body.partySize,
      special_requests: req.body.specialRequests
    };

    const reservationId = await Reservation.create(reservationData);
    res.status(201).json({ id: reservationId, ...reservationData });
  } catch (error) {
    console.error('Error in create reservation route:', error);
    res.status(500).json({ message: 'Error creating reservation' });
  }
});

// Get user's reservations
router.get('/user', auth, async (req, res) => {
  try {
    const reservations = await Reservation.getByUserId(req.user._id);
    res.json(reservations);
  } catch (error) {
    console.error('Error in get user reservations route:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Update reservation status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const success = await Reservation.updateStatus(id, status);
    if (success) {
      res.json({ message: 'Reservation status updated' });
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    console.error('Error in update reservation status route:', error);
    res.status(500).json({ message: 'Error updating reservation status' });
  }
});

// Update reservation
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      date: req.body.date,
      time: req.body.time,
      partySize: req.body.partySize,
      specialRequests: req.body.specialRequests
    };

    const success = await Reservation.update(id, updateData);
    if (success) {
      res.json({ message: 'Reservation updated' });
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    console.error('Error in update reservation route:', error);
    res.status(500).json({ message: 'Error updating reservation' });
  }
});

// Delete reservation
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Reservation.delete(id);
    if (success) {
      res.json({ message: 'Reservation deleted' });
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    console.error('Error in delete reservation route:', error);
    res.status(500).json({ message: 'Error deleting reservation' });
  }
});

// Create a reservation from Botpress (no auth required)
router.post('/bot', async (req, res) => {
  try {
    const reservationData = {
      userId: 'botpress',
      customerName: req.body.customerName,
      phone: req.body.phone || '',
      email: req.body.email || '',
      date: req.body.date,
      time: req.body.time,
      partySize: req.body.partySize,
      special_requests: req.body.special_requests || '',
      status: 'pending'
    };

    const reservationId = await Reservation.create(reservationData);
    res.status(201).json({ 
      id: reservationId, 
      ...reservationData,
      message: 'Reservation created successfully from Botpress'
    });
  } catch (error) {
    console.error('Error in create Botpress reservation route:', error);
    res.status(500).json({ message: 'Error creating reservation' });
  }
});

// Submit review for a reservation
router.put('/:id/review', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Verify the reservation belongs to the user
    const reservation = await Reservation.getById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.user_id !== req.user._id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow reviews for completed reservations
    if (reservation.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed reservations' });
    }

    // Update reservation with review data
    const success = await Reservation.addReview(id, { rating, comment });

    if (success) {
      res.json({ message: 'Review submitted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to submit review' });
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Error submitting review' });
  }
});

// Check availability (no auth required)
router.get('/availability', async (req, res) => {
  try {
    const { date, time, partySize } = req.query;

    // You can implement your own availability logic here
    // For example, check if there are too many reservations for that time slot

    // Simple example: limit to 5 reservations per time slot
    const sql = `
      SELECT COUNT(*) as count
      FROM reservations
      WHERE date = ? AND time = ?
    `;

    const [rows] = await db.query(sql, [date, time]);
    const count = rows[0].count;

    // Determine if tables are available
    const available = count < 5;

    res.json({
      available,
      message: available
        ? 'Tables are available for your party!'
        : 'Sorry, no tables available at that time.'
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Error checking availability' });
  }
});

module.exports = router;
