const { Client } = require('@botpress/client');
require('dotenv').config();

// Initialize Botpress client
const botpressClient = new Client({
  token: process.env.BOTPRESS_PAT, // Personal Access Token
  botId: process.env.BOTPRESS_BOT_ID,
  workspaceId: process.env.BOTPRESS_WORKSPACE_ID
});

// Utility functions for Botpress integration
const botpressUtils = {
  // Get all reservations from Botpress
  getReservations: async () => {
    try {
      const { rows } = await botpressClient.listTableRows({
        tableId: 'ReservationTable'
      });
      return rows;
    } catch (error) {
      console.error('Error fetching Botpress reservations:', error);
      throw error;
    }
  },

  // Create a reservation in Botpress
  createReservation: async (reservationData) => {
    try {
      const row = await botpressClient.createTableRow({
        tableId: 'ReservationTable',
        row: {
          email: reservationData.email,
          dateTime: reservationData.date + 'T' + reservationData.time + ':00',
          partySize: reservationData.partySize.toString()
        }
      });
      return row;
    } catch (error) {
      console.error('Error creating Botpress reservation:', error);
      throw error;
    }
  },

  // Sync reservations from MySQL to Botpress
  syncReservationsToBot: async (mysqlReservations) => {
    try {
      // Get existing Botpress reservations
      const botpressReservations = await botpressUtils.getReservations();
      const botpressEmails = new Set(botpressReservations.map(r => r.email));
      
      // Find reservations that need to be added to Botpress
      const newReservations = mysqlReservations.filter(r => 
        r.email && !botpressEmails.has(r.email)
      );
      
      // Add new reservations to Botpress
      for (const reservation of newReservations) {
        await botpressUtils.createReservation({
          email: reservation.email,
          date: reservation.date,
          time: reservation.time,
          partySize: reservation.party_size
        });
      }
      
      return {
        success: true,
        synced: newReservations.length
      };
    } catch (error) {
      console.error('Error syncing reservations to Botpress:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Sync reservations from Botpress to MySQL
  syncReservationsFromBot: async () => {
    try {
      const Reservation = require('../models/reservation');
      const db = require('../db');
      
      // Get all Botpress reservations
      const botpressReservations = await botpressUtils.getReservations();
      let syncCount = 0;
      
      for (const botReservation of botpressReservations) {
        // Skip if missing required data
        if (!botReservation.email || !botReservation.dateTime || !botReservation.partySize) {
          continue;
        }
        
        // Parse dateTime into date and time
        const dateTime = new Date(botReservation.dateTime);
        const date = dateTime.toISOString().split('T')[0];
        const time = dateTime.toTimeString().split(' ')[0].substring(0, 5);
        
        // Check if reservation already exists in botpress_reservations table
        const [existingBotpressReservations] = await db.query(
          'SELECT * FROM botpress_reservations WHERE email = ? AND datetime = ?',
          [botReservation.email, dateTime.toISOString().slice(0, 19).replace('T', ' ')]
        );
        
        if (existingBotpressReservations.length === 0) {
          // First, create the main reservation
          const reservationId = await Reservation.create({
            userId: 'botpress',
            customerName: botReservation.email.split('@')[0], // Use email username as name
            email: botReservation.email,
            date: date,
            time: time,
            partySize: parseInt(botReservation.partySize),
            special_requests: '',
            status: 'confirmed'
          });
          
          // Then, store the Botpress-specific data
          await db.query(
            `INSERT INTO botpress_reservations 
             (email, datetime, party_size, reservation_id) 
             VALUES (?, ?, ?, ?)`,
            [
              botReservation.email,
              dateTime.toISOString().slice(0, 19).replace('T', ' '),
              parseInt(botReservation.partySize),
              reservationId
            ]
          );
          
          syncCount++;
        }
      }
      
      return {
        success: true,
        synced: syncCount
      };
    } catch (error) {
      console.error('Error syncing reservations from Botpress:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = botpressUtils;
