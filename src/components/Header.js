import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, shadows, typography } from '../themes/theme';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount 
} from '../services/notificationService';

const Header = ({ onMenuToggle, isMobile, sidebarOpen }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from local storage
  useEffect(() => {
    const loadNotifications = () => {
      const localNotifications = getNotifications();
      setNotifications(localNotifications);
      setUnreadCount(getUnreadCount());
    };

    loadNotifications();
    
    // Listen for notification events - immediate updates
    const handleNotificationAdded = (event) => {
      const { allNotifications } = event.detail;
      setNotifications(allNotifications);
      setUnreadCount(getUnreadCount());
    };

    const handleNotificationRead = (event) => {
      const { allNotifications } = event.detail;
      setNotifications(allNotifications);
      setUnreadCount(getUnreadCount());
    };

    const handleAllNotificationsRead = (event) => {
      const { allNotifications } = event.detail;
      setNotifications(allNotifications);
      setUnreadCount(0);
    };

    const handleNotificationsCleared = (event) => {
      const { allNotifications } = event.detail;
      setNotifications(allNotifications);
      setUnreadCount(0);
    };

    // Add event listeners for immediate updates
    window.addEventListener('notificationAdded', handleNotificationAdded);
    window.addEventListener('notificationRead', handleNotificationRead);
    window.addEventListener('allNotificationsRead', handleAllNotificationsRead);
    window.addEventListener('notificationsCleared', handleNotificationsCleared);
    
    // Listen for storage changes (in case notifications are added from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'buscollege_notifications') {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Refresh notifications every 30 seconds as backup
    const interval = setInterval(loadNotifications, 30000);
    
    return () => {
      window.removeEventListener('notificationAdded', handleNotificationAdded);
      window.removeEventListener('notificationRead', handleNotificationRead);
      window.removeEventListener('allNotificationsRead', handleAllNotificationsRead);
      window.removeEventListener('notificationsCleared', handleNotificationsCleared);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const styles = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `${spacing.md} ${spacing.xl}`,
      backgroundColor: colors.primary.main,
      color: colors.text.light,
      boxShadow: shadows.md,
      zIndex: 1000,
      position: 'fixed',
      top: 0,
      right: 0,
      left: isMobile ? 0 : (sidebarOpen ? '280px' : 0),
      height: '64px',
      transition: 'left 0.3s ease',
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
    },
    title: {
      fontSize: isMobile ? '1.2rem' : typography.h4.fontSize,
      fontWeight: typography.fontWeightMedium,
      margin: 0,
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md
    },
    userText: {
      fontSize: isMobile ? '0.875rem' : typography.fontSize,
      fontWeight: typography.fontWeightRegular,
    },
    menuButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.text.light,
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: spacing.sm,
      borderRadius: '4px',
      transition: 'background-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
    },
    notificationButton: {
      position: 'relative',
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.text.light,
      fontSize: '1.2rem',
      cursor: 'pointer',
      padding: spacing.sm,
      borderRadius: '50%',
      transition: 'background-color 0.2s',
    },
    notificationBadge: {
      position: 'absolute',
      top: '2px',
      right: '2px',
      backgroundColor: colors.status.error,
      color: colors.text.light,
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
    },
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.1)' },
      '100%': { transform: 'scale(1)' },
    },
    notificationDropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      backgroundColor: colors.background.paper,
      border: `1px solid ${colors.border.light}`,
      borderRadius: '8px',
      boxShadow: shadows.lg,
      width: '320px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 1001,
    },
    notificationHeader: {
      padding: spacing.md,
      borderBottom: `1px solid ${colors.border.light}`,
      fontWeight: typography.fontWeightMedium,
      color: colors.text.primary,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    notificationHeaderActions: {
      display: 'flex',
      gap: spacing.sm,
    },
    clearAllButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.primary.main,
      fontSize: '0.8rem',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
    },
    notificationItem: {
      padding: spacing.md,
      borderBottom: `1px solid ${colors.border.light}`,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    notificationTitle: {
      fontWeight: typography.fontWeightMedium,
      color: colors.text.primary,
      fontSize: '0.9rem',
      margin: 0,
    },
    notificationMessage: {
      color: colors.text.secondary,
      fontSize: '0.8rem',
      margin: `${spacing.xs} 0 0 0`,
    },
    notificationTime: {
      color: colors.text.secondary,
      fontSize: '0.75rem',
      marginTop: spacing.xs,
    },
    emptyNotifications: {
      padding: spacing.lg,
      textAlign: 'center',
      color: colors.text.secondary,
      fontSize: '0.9rem',
    },
  };

  const formatNotificationTime = (timeString) => {
    const time = new Date(timeString);
    const now = new Date();
    const diff = now - time;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification) => {
    if (notification.unread) {
      markAsRead(notification.id);
      // Don't manually update state here - let the event handler do it
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    // Don't manually update state here - let the event handler do it
  };

  const handleNotificationButtonHover = (e, isHovering) => {
    if (isHovering) {
      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    } else {
      e.target.style.backgroundColor = 'transparent';
    }
  };

  const handleMenuButtonHover = (e, isHovering) => {
    if (isHovering) {
      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    } else {
      e.target.style.backgroundColor = 'transparent';
    }
  };

  const handleClearAllHover = (e, isHovering) => {
    if (isHovering) {
      e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    } else {
      e.target.style.backgroundColor = 'transparent';
    }
  };

  return (
    <>
      {/* Add CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
      
      <header style={styles.header}>
        <div style={styles.leftSection}>
          <button 
            style={styles.menuButton}
            onClick={onMenuToggle}
            onMouseEnter={(e) => handleMenuButtonHover(e, true)}
            onMouseLeave={(e) => handleMenuButtonHover(e, false)}
            title={sidebarOpen ? "Close Menu" : "Open Menu"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          
          <h1 style={styles.title}>Bus College Admin</h1>
        </div>
        
        <div style={styles.userInfo}>
          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button 
              style={styles.notificationButton}
              onClick={() => setShowNotifications(!showNotifications)}
              onMouseEnter={(e) => handleNotificationButtonHover(e, true)}
              onMouseLeave={(e) => handleNotificationButtonHover(e, false)}
              title={`${unreadCount} unread notifications`}
            >
              🔔
              {unreadCount > 0 && (
                <span style={styles.notificationBadge}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div style={styles.notificationDropdown}>
                <div style={styles.notificationHeader}>
                  <span>Recent Notifications</span>
                  <div style={styles.notificationHeaderActions}>
                    {unreadCount > 0 && (
                      <button 
                        style={styles.clearAllButton}
                        onClick={handleMarkAllAsRead}
                        onMouseEnter={(e) => handleClearAllHover(e, true)}
                        onMouseLeave={(e) => handleClearAllHover(e, false)}
                        title="Mark all as read"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id}
                      style={{
                        ...styles.notificationItem,
                        backgroundColor: notification.unread ? '#f3f4f6' : 'transparent'
                      }}
                      onClick={() => handleNotificationClick(notification)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = notification.unread ? '#f3f4f6' : 'transparent'}
                    >
                      <h4 style={styles.notificationTitle}>
                        {notification.title}
                        {notification.unread && <span style={{ color: colors.primary.main, marginLeft: '8px' }}>•</span>}
                      </h4>
                      <p style={styles.notificationMessage}>{notification.message}</p>
                      <span style={styles.notificationTime}>{formatNotificationTime(notification.time)}</span>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyNotifications}>
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <span style={styles.userText}>
            Welcome, {currentUser?.displayName || currentUser?.email || 'User'}
          </span>
        </div>
      </header>
    </>
  );
};

export default Header; 