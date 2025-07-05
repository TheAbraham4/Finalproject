require('dotenv').config();
const BOTPRESS_API_URL = process.env.BOTPRESS_API_URL;
const axios = require('axios');

module.exports = {
  // Create a new reservation from Botpress conversation
  createReservation: async (data) => {
    try {
      const reservationData = {
        email: data.customer.email || '',
        date: data.reservation.date,
        time: data.reservation.time,
        partySize: parseInt(data.reservation.partySize),
        source: 'botpress'
      };

      const response = await axios.post(`${BOTPRESS_API_URL}/botpress-reservations`, reservationData);
      return {
        success: true,
        reservationId: response.data.id
      };
    } catch (error) {
      console.error('Error creating reservation from Botpress:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Check table availability
  checkAvailability: async (data) => {
    try {
      const params = {
        date: data.date,
        time: data.time,
        partySize: data.partySize
      };

      const response = await axios.get(`${BOTPRESS_API_URL}/reservations/availability`, { params });
      return {
        success: true,
        available: response.data.available,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}; 
