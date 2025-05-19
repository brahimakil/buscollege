import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { colors, spacing, typography, shadows, borderRadius, breakpoints } from '../themes/theme';
import { getAllBuses } from "../services/busService";
import { getAllDrivers } from "../services/driverService";
import { getAllRiders } from "../services/riderService";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const getDashboardStyles = () => {
  return {
    container: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: spacing.md,
      marginBottom: spacing.lg,
      [`@media (min-width: ${breakpoints.sm})`]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: spacing.lg,
      },
      [`@media (min-width: ${breakpoints.md})`]: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        marginBottom: spacing.xl,
      },
    },
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      boxShadow: shadows.sm,
      transition: '0.3s ease',
      '&:hover': {
        boxShadow: shadows.md
      },
      [`@media (min-width: ${breakpoints.sm})`]: {
        padding: spacing.lg,
      },
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: spacing.md
    },
    icon: {
      fontSize: '1.5rem',
      marginRight: spacing.md,
      color: colors.primary.main,
      [`@media (min-width: ${breakpoints.md})`]: {
        fontSize: '2rem',
      },
    },
    title: {
      fontSize: typography.h5.fontSize,
      fontWeight: typography.fontWeightMedium,
      color: colors.text.primary,
      margin: 0
    },
    value: {
      fontSize: '1.5rem',
      fontWeight: typography.fontWeightBold,
      color: colors.text.primary,
      margin: `${spacing.sm} 0`,
      [`@media (min-width: ${breakpoints.md})`]: {
        fontSize: '2rem',
      },
    },
    subtitle: {
      fontSize: typography.fontSize * 0.9,
      color: colors.text.secondary,
      margin: 0,
      [`@media (min-width: ${breakpoints.md})`]: {
        fontSize: typography.fontSize,
      },
    },
    recentActivity: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      boxShadow: shadows.sm,
      marginTop: spacing.lg,
      [`@media (min-width: ${breakpoints.md})`]: {
        padding: spacing.lg,
        marginTop: spacing.xl,
      },
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: typography.fontWeightMedium,
      color: colors.text.primary,
      marginBottom: spacing.md,
      [`@media (min-width: ${breakpoints.md})`]: {
        fontSize: typography.h5.fontSize,
        marginBottom: spacing.lg,
      },
    },
    activityItem: {
      padding: spacing.sm,
      borderBottom: `1px solid ${colors.border.light}`,
      display: 'flex',
      alignItems: 'center',
      [`@media (min-width: ${breakpoints.md})`]: {
        padding: spacing.md,
      },
    },
    activityIcon: {
      width: '32px',
      height: '32px',
      borderRadius: borderRadius.round,
      backgroundColor: colors.primary.light,
      color: colors.text.light,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
      fontSize: '1rem',
      [`@media (min-width: ${breakpoints.md})`]: {
        width: '40px',
        height: '40px',
        marginRight: spacing.md,
        fontSize: '1.2rem',
      },
    },
    activityContent: {
      flex: 1
    },
    activityTitle: {
      fontSize: '0.9rem',
      fontWeight: typography.fontWeightMedium,
      color: colors.text.primary,
      margin: 0,
      [`@media (min-width: ${breakpoints.md})`]: {
        fontSize: typography.fontSize,
      },
    },
    activityTime: {
      fontSize: '0.75rem',
      color: colors.text.secondary,
      margin: 0,
      [`@media (min-width: ${breakpoints.md})`]: {
        fontSize: '0.85rem',
      },
    },
    paymentSummary: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      boxShadow: shadows.sm,
      marginTop: spacing.lg,
      [`@media (min-width: ${breakpoints.md})`]: {
        padding: spacing.lg,
        marginTop: spacing.xl,
      },
    },
    statusCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.sm,
      backgroundColor: colors.background.default,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.sm,
      [`@media (min-width: ${breakpoints.md})`]: {
        padding: spacing.md,
        marginBottom: spacing.md,
      },
    },
    statusLabel: {
      fontWeight: typography.fontWeightMedium,
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.9rem',
      [`@media (min-width: ${breakpoints.md})`]: {
        fontSize: typography.fontSize,
      },
    },
    statusValue: {
      fontSize: '1rem',
      fontWeight: typography.fontWeightBold,
      [`@media (min-width: ${breakpoints.md})`]: {
        fontSize: '1.2rem',
      },
    },
    statusIcon: {
      marginRight: spacing.sm,
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.text.light,
      fontSize: '0.7rem',
      [`@media (min-width: ${breakpoints.md})`]: {
        width: '24px',
        height: '24px',
        fontSize: '0.8rem',
      },
    },
    loadingContainer: {
      textAlign: 'center',
      padding: spacing.lg,
      color: colors.text.secondary,
      [`@media (min-width: ${breakpoints.md})`]: {
        padding: spacing.xl,
      },
    },
    pageTitle: {
      fontSize: '1.5rem',
      marginBottom: spacing.lg,
      [`@media (min-width: ${breakpoints.md})`]: {
        fontSize: typography.h3.fontSize,
        marginBottom: spacing.xl,
      },
    }
  };
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalDrivers: 0,
    totalRiders: 0,
    totalLocations: 0
  });
  const [activities, setActivities] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    paid: 0,
    pending: 0,
    unpaid: 0
  });
  const [loading, setLoading] = useState(true);
  const styles = getDashboardStyles();

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch buses, drivers, and riders
        const [busesResult, driversResult, ridersResult] = await Promise.all([
          getAllBuses(),
          getAllDrivers(),
          getAllRiders()
        ]);

        // Calculate total locations from all buses
        let locationSet = new Set();
        if (busesResult.buses) {
          busesResult.buses.forEach(bus => {
            if (bus.locations && Array.isArray(bus.locations)) {
              bus.locations.forEach(location => {
                if (location.name) {
                  locationSet.add(location.name);
                }
              });
            }
          });
        }

        // Calculate payment statistics from rider bus assignments
        let paid = 0, pending = 0, unpaid = 0;
        if (ridersResult.riders) {
          ridersResult.riders.forEach(rider => {
            if (rider.busAssignments && Array.isArray(rider.busAssignments)) {
              rider.busAssignments.forEach(assignment => {
                if (typeof assignment === 'object' && assignment.paymentStatus) {
                  if (assignment.paymentStatus === 'paid') paid++;
                  else if (assignment.paymentStatus === 'pending') pending++;
                  else if (assignment.paymentStatus === 'unpaid') unpaid++;
                }
              });
            }
          });
        }

        // Set all stats
        setStats({
          totalBuses: busesResult.buses ? busesResult.buses.length : 0,
          totalDrivers: driversResult.drivers ? driversResult.drivers.length : 0,
          totalRiders: ridersResult.riders ? ridersResult.riders.length : 0,
          totalLocations: locationSet.size
        });

        setPaymentStats({ paid, pending, unpaid });

        // Fetch recent activities
        await fetchRecentActivities();
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch recent activity from Firestore based on timestamps
  const fetchRecentActivities = async () => {
    try {
      // Fetch recent user creations (riders/drivers)
      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      // Fetch recent bus creations/updates
      const busesQuery = query(
        collection(db, "buses"),
        orderBy("updatedAt", "desc"),
        limit(5)
      );
      const busesSnapshot = await getDocs(busesQuery);

      // Combine and format activities
      const combinedActivities = [];

      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.createdAt) {
          combinedActivities.push({
            id: doc.id,
            title: `New ${userData.role || 'user'} registered: ${userData.name}`,
            time: userData.createdAt,
            icon: userData.role === 'driver' ? '👨‍✈️' : '👤',
            type: 'user'
          });
        }
      });

      busesSnapshot.forEach(doc => {
        const busData = doc.data();
        if (busData.updatedAt) {
          combinedActivities.push({
            id: doc.id,
            title: `Bus ${busData.busName} ${busData.createdAt && busData.createdAt.isEqual(busData.updatedAt) ? 'created' : 'updated'}`,
            time: busData.updatedAt,
            icon: '🚌',
            type: 'bus'
          });
        }
      });

      // Sort by time, most recent first
      combinedActivities.sort((a, b) => {
        // Convert Firestore Timestamp to milliseconds for comparison
        const timeA = a.time instanceof Timestamp ? a.time.toMillis() : a.time;
        const timeB = b.time instanceof Timestamp ? b.time.toMillis() : b.time;
        return timeB - timeA;
      });

      // Limit to 10 most recent activities
      setActivities(combinedActivities.slice(0, 10).map(activity => {
        // Format the time
        const timestamp = activity.time instanceof Timestamp 
          ? activity.time.toDate() 
          : new Date(activity.time);
        
        const now = new Date();
        const diffMs = now - timestamp;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        let timeString;
        if (diffSecs < 60) {
          timeString = `${diffSecs} seconds ago`;
        } else if (diffMins < 60) {
          timeString = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffHours < 24) {
          timeString = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else {
          timeString = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        }

        return {
          ...activity,
          formattedTime: timeString
        };
      }));
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={styles.loadingContainer}>
          Loading dashboard data...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h2 style={styles.pageTitle}>
        Dashboard Overview
      </h2>
      
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.icon}>🚌</span>
            <h3 style={styles.title}>Total Buses</h3>
          </div>
          <div style={styles.value}>{stats.totalBuses}</div>
          <p style={styles.subtitle}>Active buses in system</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.icon}>👨‍✈️</span>
            <h3 style={styles.title}>Total Drivers</h3>
          </div>
          <div style={styles.value}>{stats.totalDrivers}</div>
          <p style={styles.subtitle}>Registered bus drivers</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.icon}>👥</span>
            <h3 style={styles.title}>Total Riders</h3>
          </div>
          <div style={styles.value}>{stats.totalRiders}</div>
          <p style={styles.subtitle}>Registered passengers</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.icon}>🗺️</span>
            <h3 style={styles.title}>Locations</h3>
          </div>
          <div style={styles.value}>{stats.totalLocations}</div>
          <p style={styles.subtitle}>Bus stop locations</p>
        </div>
      </div>
      
      <div style={styles.paymentSummary}>
        <h3 style={styles.sectionTitle}>Payment Summary</h3>
        
        <div style={styles.statusCard}>
          <div style={styles.statusLabel}>
            <div style={{
              ...styles.statusIcon,
              backgroundColor: colors.status.success
            }}>✓</div>
            Paid Subscriptions
          </div>
          <div style={{
            ...styles.statusValue,
            color: colors.status.success
          }}>{paymentStats.paid}</div>
        </div>
        
        <div style={styles.statusCard}>
          <div style={styles.statusLabel}>
            <div style={{
              ...styles.statusIcon,
              backgroundColor: colors.status.warning
            }}>⌛</div>
            Pending Payments
          </div>
          <div style={{
            ...styles.statusValue,
            color: colors.status.warning
          }}>{paymentStats.pending}</div>
        </div>
        
        <div style={styles.statusCard}>
          <div style={styles.statusLabel}>
            <div style={{
              ...styles.statusIcon,
              backgroundColor: colors.status.error
            }}>!</div>
            Unpaid Subscriptions
          </div>
          <div style={{
            ...styles.statusValue,
            color: colors.status.error
          }}>{paymentStats.unpaid}</div>
        </div>
      </div>
      
      <div style={styles.recentActivity}>
        <h3 style={styles.sectionTitle}>Recent Activity</h3>
        
        {activities.length > 0 ? activities.map((activity, index) => (
          <div key={`${activity.id}-${index}`} style={styles.activityItem}>
            <div style={styles.activityIcon}>
              {activity.icon}
            </div>
            <div style={styles.activityContent}>
              <h4 style={styles.activityTitle}>{activity.title}</h4>
              <p style={styles.activityTime}>{activity.formattedTime}</p>
            </div>
          </div>
        )) : (
          <p>No recent activity found.</p>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard; 