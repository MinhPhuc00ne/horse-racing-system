import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import {
  getMyNotificationsAPI,
  getUnreadCountAPI,
  markAsReadAPI,
  markAllAsReadAPI,
} from '../services/notification';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, accessToken } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [notifs, countData] = await Promise.all([
        getMyNotificationsAPI(),
        getUnreadCountAPI(),
      ]);
      setNotifications(notifs);
      setUnreadCount(countData.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await markAsReadAPI(id);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadAPI();
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Real-time notification subscription via SSE
  useEffect(() => {
    if (!user) {
      // Clear notification state on logout
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Fetch initial notifications
    fetchNotifications();

    const token = accessToken || localStorage.getItem('horse_racing_accessToken');
    if (!token) return;

    // Connect to SSE endpoint
    const sseUrl = `http://localhost:8080/api/notifications/subscribe?token=${token}`;
    console.log('[SSE] Connecting to notification stream...');
    const eventSource = new EventSource(sseUrl);

    eventSource.addEventListener('CONNECT', (event) => {
      console.log('[SSE] Connected successfully:', event.data);
    });

    eventSource.addEventListener('NOTIFICATION', (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('[SSE] Received notification:', payload);
        
        // Add to the top of the list
        setNotifications((prev) => {
          // Prevent duplicates if SSE and initial fetch overlap
          if (prev.some((n) => n.id === payload.id)) {
            return prev;
          }
          return [payload, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
      } catch (err) {
        console.error('[SSE] Failed to parse notification data:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error/closed:', err);
    };

    return () => {
      console.log('[SSE] Closing connection...');
      eventSource.close();
    };
  }, [user, accessToken]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
