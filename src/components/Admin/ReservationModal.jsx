import React, { useState } from 'react';

const ReservationModal = ({ reservation, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    customerName: reservation.customer_name,
    email: reservation.email || '',
    phone: reservation.phone || '',
    date: reservation.date.split('T')[0], // Format date for input
    time: reservation.time.slice(0, 5), // Remove seconds
    partySize: reservation.party_size,
    specialRequests: reservation.special_requests || '',
    status: reservation.status
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' },
    { value: 'cancelled-by-customer', label: 'Cancelled by Customer' },
    { value: 'cancelled-by-restaurant', label: 'Cancelled by Restaurant' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/reservations/${reservation.id}`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          time: formData.time,
          partySize: parseInt(formData.partySize),
          specialRequests: formData.specialRequests,
          status: formData.status
        })
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate(); // Refresh the parent component
        alert('Reservation updated successfully!');
      } else {
        alert('Failed to update reservation');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert('Error updating reservation');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this reservation? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/admin/reservations/${reservation.id}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          onUpdate(); // Refresh the parent component
          onClose(); // Close the modal
          alert('Reservation deleted successfully!');
        } else {
          alert('Failed to delete reservation');
        }
      } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Error deleting reservation');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reservation Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="reservation-info">
            <div className="info-section">
              <h3>Customer Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Customer Name:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{reservation.customer_name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{reservation.email || 'N/A'}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone:</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{reservation.phone || 'N/A'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>Reservation Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Date:</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{formatDate(reservation.date)}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Time:</label>
                  {isEditing ? (
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{reservation.time.slice(0, 5)}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Party Size:</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="partySize"
                      min="1"
                      max="20"
                      value={formData.partySize}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{reservation.party_size} people</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Status:</label>
                  {isEditing ? (
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`status-badge ${reservation.status}`}>
                      {statusOptions.find(opt => opt.value === reservation.status)?.label || reservation.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>Special Requests</h3>
              {isEditing ? (
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any special requests..."
                />
              ) : (
                <p>{reservation.special_requests || 'No special requests'}</p>
              )}
            </div>

            <div className="info-section">
              <h3>System Information</h3>
              <div className="system-info">
                <p><strong>Reservation ID:</strong> {reservation.id}</p>
                <p><strong>Source:</strong> {reservation.source || 'Website'}</p>
                <p><strong>Created:</strong> {new Date(reservation.created_at).toLocaleString()}</p>
                {reservation.updated_at && (
                  <p><strong>Last Updated:</strong> {new Date(reservation.updated_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <div className="edit-actions">
              <button onClick={handleSave} className="save-btn">Save Changes</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          ) : (
            <div className="view-actions">
              <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
              <button onClick={handleDelete} className="delete-btn">Delete</button>
              <button onClick={onClose} className="close-modal-btn">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
