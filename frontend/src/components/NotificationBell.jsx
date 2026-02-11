import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUnreadCount } from '../services/notificationService';
import './NotificationBell.css';

/**
 * NotificationBell Component - Displays notification bell icon with unread count badge
 */
const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch unread count on mount
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-bell-wrapper">
      <button
        className="notification-bell"
        onClick={handleBellClick}
        title="View notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="dropdown-body">
            {unreadCount > 0 ? (
              <>
                <div className="unread-info">
                  You have {unreadCount} unread notification
                  {unreadCount !== 1 ? 's' : ''}
                </div>
                <Link
                  to="/notifications"
                  className="view-all-link"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications →
                </Link>
              </>
            ) : (
              <div className="empty-info">All caught up! 👍</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
