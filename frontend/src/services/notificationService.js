/**
 * Notification Service - API calls for notifications
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Get all notifications for the logged-in user
 * @param {number} page - Page number for pagination (default: 1)
 * @returns {Promise} - List of notifications
 */
export const getNotifications = async (page = 1) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/?page=${page}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get a single notification by ID
 * @param {number} id - Notification ID
 * @returns {Promise} - Notification object
 */
export const getNotification = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${id}/`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch notification');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notification:', error);
    throw error;
  }
};

/**
 * Mark a single notification as read
 * @param {number} id - Notification ID
 * @returns {Promise} - Updated notification object
 */
export const markNotificationAsRead = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${id}/read/`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_read: true }),
      }
    );
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Get count of unread notifications
 * @returns {Promise} - Object with unread_count
 */
export const getUnreadCount = async () => {
  const token = localStorage.getItem("access");

  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch(
    "http://localhost:8000/api/notifications/unread-count/",
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch unread count");
  }

  return response.json();
};
/**
 * Mark all notifications as read
 * @returns {Promise} - Status message
 */
export const markAllAsRead = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/mark-all-as-read/`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to mark all as read');
    return await response.json();
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

/**
 * Get notification statistics
 * @returns {Promise} - Statistics object
 */
export const getNotificationStats = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/stats/`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};
