// Notification service for managing local storage notifications
const NOTIFICATION_KEY = 'buscollege_notifications';
const NOTIFICATION_EVENT = 'notificationAdded';

// Get all notifications from local storage
export const getNotifications = () => {
  try {
    const notifications = localStorage.getItem(NOTIFICATION_KEY);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [];
  }
};

// Add a new notification
export const addNotification = (notification) => {
  try {
    const notifications = getNotifications();
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      time: new Date().toISOString(),
      unread: true
    };
    
    notifications.unshift(newNotification);
    
    // Keep only the last 50 notifications
    const trimmedNotifications = notifications.slice(0, 50);
    
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(trimmedNotifications));
    
    // Dispatch custom event to notify components immediately
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, {
      detail: { newNotification, allNotifications: trimmedNotifications }
    }));
    
    return newNotification;
  } catch (error) {
    console.error("Error adding notification:", error);
    return null;
  }
};

// Mark a notification as read
export const markAsRead = (notificationId) => {
  try {
    const notifications = getNotifications();
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, unread: false }
        : notification
    );
    
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updatedNotifications));
    
    // Dispatch event for read status change
    window.dispatchEvent(new CustomEvent('notificationRead', {
      detail: { notificationId, allNotifications: updatedNotifications }
    }));
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

// Mark all notifications as read
export const markAllAsRead = () => {
  try {
    const notifications = getNotifications();
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      unread: false
    }));
    
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updatedNotifications));
    
    // Dispatch event for all read
    window.dispatchEvent(new CustomEvent('allNotificationsRead', {
      detail: { allNotifications: updatedNotifications }
    }));
    
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

// Clear all notifications
export const clearAllNotifications = () => {
  try {
    localStorage.removeItem(NOTIFICATION_KEY);
    
    // Dispatch event for clearing
    window.dispatchEvent(new CustomEvent('notificationsCleared', {
      detail: { allNotifications: [] }
    }));
    
    return true;
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return false;
  }
};

// Get unread notification count
export const getUnreadCount = () => {
  try {
    const notifications = getNotifications();
    return notifications.filter(notification => notification.unread).length;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

// Notification types and helper functions
export const NOTIFICATION_TYPES = {
  BUS_CREATED: 'bus_created',
  BUS_UPDATED: 'bus_updated',
  BUS_DELETED: 'bus_deleted',
  RIDER_CREATED: 'rider_created',
  RIDER_UPDATED: 'rider_updated',
  RIDER_DELETED: 'rider_deleted',
  DRIVER_CREATED: 'driver_created',
  DRIVER_UPDATED: 'driver_updated',
  DRIVER_DELETED: 'driver_deleted',
  PAYMENT_UPDATED: 'payment_updated',
  RIDER_REMOVED_FROM_BUS: 'rider_removed_from_bus',
  DRIVER_REMOVED_FROM_BUS: 'driver_removed_from_bus'
};

// Helper functions for specific notification types
export const addBusNotification = (type, busName, additionalInfo = '') => {
  const titles = {
    [NOTIFICATION_TYPES.BUS_CREATED]: 'Bus Created',
    [NOTIFICATION_TYPES.BUS_UPDATED]: 'Bus Updated',
    [NOTIFICATION_TYPES.BUS_DELETED]: 'Bus Deleted'
  };
  
  const messages = {
    [NOTIFICATION_TYPES.BUS_CREATED]: `Bus "${busName}" has been created successfully`,
    [NOTIFICATION_TYPES.BUS_UPDATED]: `Bus "${busName}" has been updated ${additionalInfo}`,
    [NOTIFICATION_TYPES.BUS_DELETED]: `Bus "${busName}" has been deleted`
  };
  
  return addNotification({
    type,
    title: titles[type],
    message: messages[type],
    category: 'bus'
  });
};

export const addRiderNotification = (type, riderName, additionalInfo = '') => {
  const titles = {
    [NOTIFICATION_TYPES.RIDER_CREATED]: 'Rider Created',
    [NOTIFICATION_TYPES.RIDER_UPDATED]: 'Rider Updated',
    [NOTIFICATION_TYPES.RIDER_DELETED]: 'Rider Deleted'
  };
  
  const messages = {
    [NOTIFICATION_TYPES.RIDER_CREATED]: `Rider "${riderName}" has been created successfully`,
    [NOTIFICATION_TYPES.RIDER_UPDATED]: `Rider "${riderName}" has been updated ${additionalInfo}`,
    [NOTIFICATION_TYPES.RIDER_DELETED]: `Rider "${riderName}" has been deleted`
  };
  
  return addNotification({
    type,
    title: titles[type],
    message: messages[type],
    category: 'rider'
  });
};

// Add notification for payment status updates
export const addPaymentNotification = (riderName, busName, paymentStatus) => {
  const statusMessages = {
    'paid': 'marked as paid',
    'pending': 'set to pending',
    'unpaid': 'marked as unpaid',
    'overdue': 'marked as overdue'
  };
  
  const message = `Payment for rider "${riderName}" on bus "${busName}" has been ${statusMessages[paymentStatus] || 'updated'}`;
  
  return addNotification({
    type: NOTIFICATION_TYPES.PAYMENT_UPDATED,
    title: 'Payment Status Updated',
    message: message,
    category: 'payment'
  });
};

// Add notification for rider removal from bus
export const addRiderRemovedNotification = (riderName, busName) => {
  return addNotification({
    type: NOTIFICATION_TYPES.RIDER_REMOVED_FROM_BUS,
    title: 'Rider Removed from Bus',
    message: `Rider "${riderName}" has been removed from bus "${busName}"`,
    category: 'rider'
  });
};

// Add notification for driver removal from bus
export const addDriverRemovedNotification = (driverName, busName) => {
  return addNotification({
    type: NOTIFICATION_TYPES.DRIVER_REMOVED_FROM_BUS,
    title: 'Driver Removed from Bus',
    message: `Driver "${driverName}" has been removed from bus "${busName}"`,
    category: 'driver'
  });
};

export const addDriverNotification = (type, driverName, additionalInfo = '') => {
  const titles = {
    [NOTIFICATION_TYPES.DRIVER_CREATED]: 'Driver Created',
    [NOTIFICATION_TYPES.DRIVER_UPDATED]: 'Driver Updated',
    [NOTIFICATION_TYPES.DRIVER_DELETED]: 'Driver Deleted'
  };
  
  const messages = {
    [NOTIFICATION_TYPES.DRIVER_CREATED]: `Driver "${driverName}" has been created successfully`,
    [NOTIFICATION_TYPES.DRIVER_UPDATED]: `Driver "${driverName}" has been updated ${additionalInfo}`,
    [NOTIFICATION_TYPES.DRIVER_DELETED]: `Driver "${driverName}" has been deleted`
  };
  
  return addNotification({
    type,
    title: titles[type],
    message: messages[type],
    category: 'driver'
  });
}; 