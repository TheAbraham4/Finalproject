import React from 'react';

const DashboardStats = ({ stats }) => {
  if (!stats) {
    return (
      <div className="stats-loading">
        <p>Loading statistics...</p>
      </div>
    );
  }

  const { statusCounts, dailyStats } = stats;

  const statusLabels = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'no-show': 'No Show',
    'cancelled-by-customer': 'Cancelled by Customer',
    'cancelled-by-restaurant': 'Cancelled by Restaurant'
  };

  const statusColors = {
    'pending': '#ffa500',
    'confirmed': '#28a745',
    'completed': '#6c757d',
    'cancelled': '#dc3545',
    'no-show': '#e74c3c',
    'cancelled-by-customer': '#f39c12',
    'cancelled-by-restaurant': '#8e44ad'
  };

  const totalReservations = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  // Get recent dates for daily stats
  const recentDates = Object.keys(dailyStats)
    .sort((a, b) => new Date(b) - new Date(a))
    .slice(0, 7);

  return (
    <div className="dashboard-stats">
      <div className="stats-overview">
        <h2>Reservation Overview</h2>
        
        <div className="stats-cards">
          <div className="stat-card total">
            <h3>Total Reservations</h3>
            <div className="stat-number">{totalReservations}</div>
            <p>All time</p>
          </div>

          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="stat-card" style={{ borderLeftColor: statusColors[status] }}>
              <h3>{statusLabels[status] || status}</h3>
              <div className="stat-number">{count}</div>
              <p>{((count / totalReservations) * 100).toFixed(1)}% of total</p>
            </div>
          ))}
        </div>
      </div>

      <div className="daily-stats">
        <h3>Recent Daily Activity</h3>
        <div className="daily-stats-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Pending</th>
                <th>Confirmed</th>
                <th>Completed</th>
                <th>Cancelled</th>
                <th>No Show</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentDates.map(date => {
                const dayStats = dailyStats[date] || {};
                const dayTotal = Object.values(dayStats).reduce((sum, count) => sum + count, 0);
                
                return (
                  <tr key={date}>
                    <td>{new Date(date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      weekday: 'short'
                    })}</td>
                    <td>{dayStats.pending || 0}</td>
                    <td>{dayStats.confirmed || 0}</td>
                    <td>{dayStats.completed || 0}</td>
                    <td>{(dayStats.cancelled || 0) + (dayStats['cancelled-by-customer'] || 0) + (dayStats['cancelled-by-restaurant'] || 0)}</td>
                    <td>{dayStats['no-show'] || 0}</td>
                    <td><strong>{dayTotal}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary">
            📊 Export Report
          </button>
          <button className="action-btn secondary">
            📧 Send Confirmations
          </button>
          <button className="action-btn secondary">
            🔄 Sync Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
