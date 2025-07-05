import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ReservationTable from './ReservationTable';
import DashboardStats from './DashboardStats';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    email: '',
    customerName: ''
  });

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchReservations();
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, filters]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`http://localhost:8080/api/admin/reservations?${queryParams}`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      } else {
        console.error('Failed to fetch reservations');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/reservations/stats', {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/reservations/${reservationId}/status`, {
        method: 'PATCH',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchReservations(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      date: '',
      email: '',
      customerName: ''
    });
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'reservations' ? 'active' : ''}
          onClick={() => setActiveTab('reservations')}
        >
          Reservations
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <DashboardStats stats={stats} />
        )}

        {activeTab === 'reservations' && (
          <div className="reservations-section">
            <div className="filters-section">
              <h3>Filter Reservations</h3>
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Status:</label>
                  <select 
                    value={filters.status} 
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                    <option value="cancelled-by-customer">Cancelled by Customer</option>
                    <option value="cancelled-by-restaurant">Cancelled by Restaurant</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Date:</label>
                  <input 
                    type="date" 
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Email:</label>
                  <input 
                    type="text" 
                    placeholder="Search by email"
                    value={filters.email}
                    onChange={(e) => handleFilterChange('email', e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Customer Name:</label>
                  <input 
                    type="text" 
                    placeholder="Search by name"
                    value={filters.customerName}
                    onChange={(e) => handleFilterChange('customerName', e.target.value)}
                  />
                </div>

                <div className="filter-actions">
                  <button onClick={clearFilters} className="clear-filters-btn">
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <ReservationTable 
              reservations={reservations}
              loading={loading}
              onStatusUpdate={handleStatusUpdate}
              onRefresh={fetchReservations}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
