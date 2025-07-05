import api from './api';

export const reservationService = {
  // Create a new reservation
  createReservation: async (reservationData) => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },

  // Get all reservations for the current user
  getUserReservations: async () => {
    const response = await api.get('/reservations/user');
    return response.data;
  },

  // Update a reservation
  updateReservation: async (reservationId, updateData) => {
    const response = await api.put(`/reservations/${reservationId}`, updateData);
    return response.data;
  },

  // Delete a reservation
  deleteReservation: async (reservationId) => {
    const response = await api.delete(`/reservations/${reservationId}`);
    return response.data;
  },

  // Submit a review for a reservation
  submitReview: async (reservationId, reviewData) => {
    try {
      const response = await api.put(`/reservations/${reservationId}/review`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }
}; 