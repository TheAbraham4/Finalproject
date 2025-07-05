import React, { useState } from 'react';
import ReservationModal from './ReservationModal';

const ReservationTable = ({ reservations, loading, onStatusUpdate, onRefresh }) => {
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#ffa500' },
    { value: 'confirmed', label: 'Confirmed', color: '#28a745' },
    { value: 'completed', label: 'Completed', color: '#6c757d' },
    { value: 'cancelled', label: 'Cancelled', color: '#dc3545' },
    { value: 'no-show', label: 'No Show', color: '#e74c3c' },
    { value: 'cancelled-by-customer', label: 'Cancelled by Customer', color: '#f39c12' },
    { value: 'cancelled-by-restaurant', label: 'Cancelled by Restaurant', color: '#8e44ad' }
  ];

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : '#6c757d';
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  const handleStatusChange = (reservationId, newStatus) => {
    onStatusUpdate(reservationId, newStatus);
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5); // Remove seconds
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="reservation-table-container">
      <div className="table-header">
        <h3>Reservations ({reservations.length})</h3>
        <button onClick={onRefresh} className="refresh-btn">
          Refresh
        </button>
      </div>

      {reservations.length === 0 ? (
        <div className="no-reservations">
          <p>No reservations found matching your criteria.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="reservation-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Time</th>
                <th>Party Size</th>
                <th>Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.id}</td>
                  <td>{reservation.customer_name}</td>
                  <td>{reservation.email || 'N/A'}</td>
                  <td>{reservation.phone || 'N/A'}</td>
                  <td>{formatDate(reservation.date)}</td>
                  <td>{formatTime(reservation.time)}</td>
                  <td>{reservation.party_size}</td>
                  <td>
                    <span className={`source-badge ${reservation.source?.toLowerCase()}`}>
                      {reservation.source}
                    </span>
                  </td>
                  <td>
                    <select
                      value={reservation.status}
                      onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                      className="status-select"
                      style={{ color: getStatusColor(reservation.status) }}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleViewDetails(reservation)}
                        className="view-btn"
                        title="View Details"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedReservation && (
        <ReservationModal
          reservation={selectedReservation}
          onClose={() => {
            setShowModal(false);
            setSelectedReservation(null);
          }}
          onUpdate={onRefresh}
        />
      )}
    </div>
  );
};

export default ReservationTable;
