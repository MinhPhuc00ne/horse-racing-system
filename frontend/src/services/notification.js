import axiosClient from '../api/axiosClient';

/**
 * Fetch all notifications for the logged in user
 */
export async function getMyNotificationsAPI() {
  try {
    const response = await axiosClient.get('/notifications');
    return response.data; // List of NotificationResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch notifications.';
    throw new Error(errMsg, { cause: error });
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadCountAPI() {
  try {
    const response = await axiosClient.get('/notifications/unread-count');
    return response.data; // { unreadCount: count }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch unread notifications count.';
    throw new Error(errMsg, { cause: error });
  }
}

/**
 * Mark a notification as read by its ID
 */
export async function markAsReadAPI(id) {
  try {
    const response = await axiosClient.put(`/notifications/${id}/read`);
    return response.data; // NotificationResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to mark notification as read.';
    throw new Error(errMsg, { cause: error });
  }
}

/**
 * Mark all user notifications as read
 */
export async function markAllAsReadAPI() {
  try {
    const response = await axiosClient.put('/notifications/read-all');
    return response.data; // MessageResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to mark all notifications as read.';
    throw new Error(errMsg, { cause: error });
  }
}
