import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, shadows, typography } from '../themes/theme';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const Header = ({ onMenuToggle, isMobile, sidebarOpen }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch real notifications from database
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get recent bus assignments that need attention
        const busesQuery = query(
          collection(db, "buses"),
          orderBy("updatedAt", "desc"),
          limit(5)
        );
        const busesSnapshot = await getDocs(busesQuery);

        // Get riders with pending payments
        const ridersQuery = query(
          collection(db, "users"),
          where("role", "==", "rider"),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const ridersSnapshot = await getDocs(ridersQuery);

        const newNotifications = [];
        
        // Add bus-related notifications
        busesSnapshot.forEach(doc => {
          const busData = doc.data();
          const now = new Date();
          const updatedTime = busData.updatedAt?.toDate() || new Date();
          const timeDiff = now - updatedTime;
          
          if (timeDiff < 24 * 60 * 60 * 1000) { // Within 24 hours
            newNotifications.push({
              id: `bus-${doc.id}`,
              title: `Bus ${busData.busName} updated`,
              message: `Route and schedule information changed`,
              time: updatedTime,
              type: 'bus',
              unread: true
            });
          }
        });

        // Add rider payment notifications
        let pendingPayments = 0;
        ridersSnapshot.forEach(doc => {
          const riderData = doc.data();
          if (riderData.busAssignments) {
            riderData.busAssignments.forEach(assignment => {
              if (assignment.paymentStatus === 'pending' || assignment.paymentStatus === 'unpaid') {
                pendingPayments++;
              }
            });
          }
        });

        if (pendingPayments > 0) {
          newNotifications.push({
            id: 'payments-pending',
            title: 'Payment Alerts',
            message: `${pendingPayments} pending payments require attention`,
            time: new Date(),
            type: 'payment',
            unread: true
          });
        }

        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => n.unread).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
  };

  const formatNotificationTime = (time) => {
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
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, unread: false } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
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

  return (
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
                Recent Notifications
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
                    <h4 style={styles.notificationTitle}>{notification.title}</h4>
                    <p style={styles.notificationMessage}>{notification.message}</p>
                    <span style={styles.notificationTime}>{formatNotificationTime(notification.time)}</span>
                  </div>
                ))
              ) : (
                <div style={styles.notificationItem}>
                  <p style={styles.notificationMessage}>No new notifications</p>
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
  );
};

export default Header; 