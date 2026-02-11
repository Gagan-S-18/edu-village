import React, { useState, useEffect } from 'react';
import {
  getNotifications,
  markAllAsRead,
  getNotificationStats,
} from '../services/notificationService';
import NotificationItem from '../components/NotificationItem';
import './NotificationsPage.css';

/**
 * NotificationsPage Component - Main notifications page
 */
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    by_type: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [currentPage, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(currentPage);
      
      // Filter notifications based on read status
      let filtered = data.results || [];
      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.is_read);
      } else if (filter === 'read') {
        filtered = filtered.filter(n => n.is_read);
      }
      
      setNotifications(filtered);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getNotificationStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    // Refresh stats
    fetchStats();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
      fetchStats();
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Failed to mark all as read.');
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="loading-spinner">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-content">
          <h1>Notifications</h1>
          <p className="header-subtitle">Stay updated with your activities</p>
        </div>

        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card unread">
            <div className="stat-number">{stats.unread}</div>
            <div className="stat-label">Unread</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.read}</div>
            <div className="stat-label">Read</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={fetchNotifications}>Retry</button>
        </div>
      )}

      <div className="notifications-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => handleFilterChange('unread')}
          >
            Unread ({stats.unread})
          </button>
          <button
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => handleFilterChange('read')}
          >
            Read ({stats.read})
          </button>
        </div>

        {stats.unread > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No notifications</h3>
            <p>
              {filter === 'unread'
                ? 'You are all caught up!'
                : 'No notifications to display'}
            </p>
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkAsRead}
              />
            ))}

            {pagination.count > 20 && (
              <div className="pagination">
                {pagination.previous && (
                  <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="pagination-btn"
                  >
                    ← Previous
                  </button>
                )}

                <span className="page-info">
                  Page {currentPage} of {Math.ceil(pagination.count / 20)}
                </span>

                {pagination.next && (
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="pagination-btn"
                  >
                    Next →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
