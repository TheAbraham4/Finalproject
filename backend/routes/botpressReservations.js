const express = require('express');
const router = express.Router();
const BotpressReservation = require('../models/botpressReservation');
const Reservation = require('../models/reservation');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all Botpress reservations (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const reservations = await BotpressReservation.getAll();
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching Botpress reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Create a new Botpress reservation
router.post('/', async (req, res) => {
  try {
    const apiKey = req.header('X-API-Key');
    if (process.env.BOTPRESS_API_KEY && apiKey !== process.env.BOTPRESS_API_KEY) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    console.log('🤖 Received Botpress reservation request:', JSON.stringify(req.body, null, 2));

    const email = req.body.email?.trim();
    const partySize = Number(req.body.partySize);
    const rawDateTime = req.body.datetime || req.body.dateTime;
    const customerName = req.body.customerName?.trim() || req.body.name?.trim() || email?.split('@')[0] || 'Botpress User';

    // Validate datetime
    let datetime = '';
    if (rawDateTime) {
      const dt = new Date(rawDateTime);
      if (isNaN(dt.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid datetime format' });
      }
      datetime = dt.toISOString().slice(0, 19).replace('T', ' ');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: datetime or dateTime',
        received: req.body
      });
    }

    // Validate required fields (confNumber is now optional)
    if (!email || isNaN(partySize)) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid fields: email or partySize',
        received: req.body
      });
    }

    const [date, time] = datetime.split(' ');

    const reservationData = {
      userId: 'botpress',
      email,
      customerName,
      date,
      time,
      partySize,
      status: 'pending'
    };

    console.log('📝 Creating main reservation with:', reservationData);

    let reservationId;
    try {
      reservationId = await Reservation.create(reservationData);
      console.log('✅ Created main reservation ID:', reservationId);
    } catch (err) {
      console.error('❌ Error creating main reservation:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to create main reservation',
        error: err.message
      });
    }

    // 🔐 Auto-generate confirmation number
    const confNumber = Math.floor(Math.random() * 10000);

    const botpressReservationData = {
      email,
      datetime,
      partySize,
      reservationId,
      conf_number: confNumber,
      status: 'pending'
    };

    console.log('📦 Creating Botpress reservation with:', botpressReservationData);

    try {
      const botpressReservationId = await BotpressReservation.create(botpressReservationData);
      res.status(201).json({
        success: true,
        id: botpressReservationId,
        reservationId,
        message: 'Botpress reservation created successfully',
        data: {
          email,
          datetime,
          partySize,
          confNumber,
          customerName
        }
      });
    } catch (err) {
      console.error('❌ Error creating Botpress reservation:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to create Botpress reservation',
        error: err.message
      });
    }
  } catch (error) {
    console.error('❌ Unexpected server error:', error);
    res.status(500).json({
      success: false,
      message: 'Unexpected server error',
      error: error.message
    });
  }
});

// Update reservation status
router.patch('/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;

    const updated = await BotpressReservation.update(id, { status });

    if (updated) {
      res.json({ message: 'Reservation status updated successfully' });
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    console.error('Error updating Botpress reservation status:', error);
    res.status(500).json({ message: 'Error updating reservation status' });
  }
});

// Delete a reservation
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const deleted = await BotpressReservation.delete(req.params.id);

    if (deleted) {
      res.json({ message: 'Botpress reservation deleted successfully' });
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    console.error('Error deleting Botpress reservation:', error);
    res.status(500).json({ message: 'Error deleting reservation' });
  }
});

module.exports = router;
