import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reservationService } from '../../services/reservationService';
import { FaStar, FaEdit, FaTrash } from 'react-icons/fa';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    partySize: '',
    phone: '',
    specialRequests: ''
  });

  // Review states
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const userReservations = await reservationService.getUserReservations();
      // Map party_size to partySize and special_requests to specialRequests
      const mappedReservations = userReservations.map(r => ({
        ...r,
        partySize: r.partySize || r.party_size,
        specialRequests: r.specialRequests || r.special_requests
      }));
      setReservations(mappedReservations);
    } catch (err) {
      setError('Failed to fetch reservations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const reservationPayload = {
        ...formData,
        customerName: `${currentUser.firstName} ${currentUser.lastName}`
      };
      if (isEditMode && selectedReservation) {
        await reservationService.updateReservation(selectedReservation.id, reservationPayload);
      } else {
        await reservationService.createReservation(reservationPayload);
      }
      fetchReservations();
      resetForm();
    } catch (err) {
      setError('Failed to save reservation');
      console.error(err);
    }
  };

  const handleDelete = async (reservationId) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await reservationService.deleteReservation(reservationId);
        fetchReservations();
      } catch (err) {
        setError('Failed to delete reservation');
        console.error(err);
      }
    }
  };

  const handleEdit = (reservation) => {
    setSelectedReservation(reservation);
    setFormData({
      date: reservation.date,
      time: reservation.time,
      partySize: reservation.partySize,
      phone: reservation.phone || '',
      specialRequests: reservation.specialRequests || ''
    });
    setIsEditMode(true);
  };

  const handleReviewSubmit = async (reservationId) => {
    try {
      await reservationService.submitReview(reservationId, reviewData);
      fetchReservations();
      setReviewData({ rating: 5, comment: '' });
    } catch (err) {
      setError('Failed to submit review');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      partySize: '',
      phone: '',
      specialRequests: ''
    });
    setSelectedReservation(null);
    setIsEditMode(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffd700',
      confirmed: '#4CAF50',
      cancelled: '#f44336',
      completed: '#2196F3'
    };
    return colors[status] || colors.pending;
  };

  if (loading) return <div className="app__profile-loading">Loading...</div>;

  return (
    <div className="app__profile section__padding">
      <div className="app__profile-header">
        <h1 className="headtext__cormorant">My Profile</h1>
        <p className="p__opensans">Welcome back, {currentUser.firstName}!</p>
      </div>

      {error && <div className="app__profile-error">{error}</div>}

      <div className="app__profile-content">
        {/* Reservation Form */}
        <div className="app__profile-form">
          <h2 className="headtext__cormorant">{isEditMode ? 'Edit Reservation' : 'New Reservation'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="p__opensans">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="p__opensans">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="p__opensans">Party Size</label>
              <input
                type="number"
                name="partySize"
                value={formData.partySize}
                onChange={handleInputChange}
                required
                min="1"
                max="20"
              />
            </div>

            <div className="form-group">
              <label className="p__opensans">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10,15}"
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label className="p__opensans">Special Notes</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="custom__button">
                {isEditMode ? 'Update Reservation' : 'Make Reservation'}
              </button>
              {isEditMode && (
                <button type="button" className="custom__button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Reservations List */}
        <div className="app__profile-reservations">
          <h2 className="headtext__cormorant">My Reservations</h2>
          {reservations.length === 0 ? (
            <p className="p__opensans">No reservations found.</p>
          ) : (
            <div className="reservations-list">
              {reservations.map((reservation, idx) => (
                <div key={reservation.id || reservation._id || idx} className="reservation-card">
                  <div className="reservation-header">
                    <div className="reservation-status" style={{ backgroundColor: getStatusColor(reservation.status) }}>
                      {reservation.status}
                    </div>
                    <div className="reservation-actions">
                      <button onClick={() => handleEdit(reservation)} className="icon-button">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(reservation.id)} className="icon-button">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="reservation-details">
                    <p className="p__opensans">Date: {new Date(reservation.date).toLocaleDateString()}</p>
                    <p className="p__opensans">Time: {reservation.time}</p>
                    <p className="p__opensans">
                      Party Size: {reservation.partySize || reservation.party_size}
                    </p>
                    {reservation.phone && <p className="p__opensans">Phone: {reservation.phone}</p>}
                    {reservation.specialRequests && <p className="p__opensans">Notes: {reservation.specialRequests}</p>}
                  </div>

                  {reservation.status === 'completed' && !reservation.review && (
                    <div className="reservation-review">
                      <h3 className="p__cormorant">Leave a Review</h3>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={star <= reviewData.rating ? 'star active' : 'star'}
                            onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                          />
                        ))}
                      </div>
                      <textarea
                        name="comment"
                        value={reviewData.comment}
                        onChange={handleReviewChange}
                        placeholder="Share your experience..."
                        rows="3"
                      />
                      <button
                        onClick={() => handleReviewSubmit(reservation.id)}
                        className="custom__button"
                      >
                        Submit Review
                      </button>
                    </div>
                  )}

                  {reservation.review && (
                    <div className="reservation-review">
                      <h3 className="p__cormorant">Your Review</h3>
                      <div className="rating-display">
                        {[...Array(reservation.review.rating)].map((_, i) => (
                          <FaStar key={i} className="star active" />
                        ))}
                      </div>
                      <p className="p__opensans">{reservation.review.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile; 