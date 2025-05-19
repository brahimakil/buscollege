import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { colors, spacing, typography, shadows, borderRadius } from '../themes/theme';
import { getAllBuses } from "../services/busService";
import { getAllDrivers } from "../services/driverService";
import { getAllRiders } from "../services/riderService";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const dashboardStyles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: spacing.lg,
    marginBottom: spacing.xl
  },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    transition: '0.3s ease',
    '&:hover': {
      boxShadow: shadows.md
    }
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  icon: {
    fontSize: '2rem',
    marginRight: spacing.md,
    color: colors.primary.main
  },
  title: {
    fontSize: typography.h5.fontSize,
    fontWeight: typography.fontWeightMedium,
    color: colors.text.primary,
    margin: 0
  },
  value: {
    fontSize: '2rem',
    fontWeight: typography.fontWeightBold,
    color: colors.text.primary,
    margin: `${spacing.sm} 0`
  },
  subtitle: {
    fontSize: typography.fontSize,
    color: colors.text.secondary,
    margin: 0
  },
  recentActivity: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    marginTop: spacing.xl
  },
  sectionTitle: {
    fontSize: typography.h5.fontSize,
    fontWeight: typography.fontWeightMedium,
    color: colors.text.primary,
    marginBottom: spacing.lg
  },
  activityItem: {
    padding: spacing.md,
    borderBottom: `1px solid ${colors.border.light}`,
    display: 'flex',
    alignItems: 'center'
  },
  activityIcon: {
    width: '40px',
    height: '40px',
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary.light,
    color: colors.text.light,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    fontSize: '1.2rem'
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeightMedium,
    color: colors.text.primary,
    margin: 0
  },
  activityTime: {
    fontSize: '0.85rem',
    color: colors.text.secondary,
    margin: 0
  },
  paymentSummary: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    marginTop: spacing.xl
  },
  statusCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md
  },
  statusLabel: {
    fontWeight: typography.fontWeightMedium,
    display: 'flex',
    alignItems: 'center'
  },
  statusValue: {
    fontSize: '1.2rem',
    fontWeight: typography.fontWeightBold
  },
  statusIcon: {
    marginRight: spacing.sm,
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text.light,
    fontSize: '0.8rem'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: spacing.xl,
    color: colors.text.secondary
  }
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
        <div style={dashboardStyles.loadingContainer}>
          Loading dashboard data...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h2 style={{ fontSize: typography.h3.fontSize, marginBottom: spacing.xl }}>
        Dashboard Overview
      </h2>
      
      <div style={dashboardStyles.container}>
        <div style={dashboardStyles.card}>
          <div style={dashboardStyles.cardHeader}>
            <span style={dashboardStyles.icon}>🚌</span>
            <h3 style={dashboardStyles.title}>Total Buses</h3>
          </div>
          <div style={dashboardStyles.value}>{stats.totalBuses}</div>
          <p style={dashboardStyles.subtitle}>Active buses in system</p>
        </div>

        <div style={dashboardStyles.card}>
          <div style={dashboardStyles.cardHeader}>
            <span style={dashboardStyles.icon}>👨‍✈️</span>
            <h3 style={dashboardStyles.title}>Total Drivers</h3>
          </div>
          <div style={dashboardStyles.value}>{stats.totalDrivers}</div>
          <p style={dashboardStyles.subtitle}>Registered bus drivers</p>
        </div>

        <div style={dashboardStyles.card}>
          <div style={dashboardStyles.cardHeader}>
            <span style={dashboardStyles.icon}>👥</span>
            <h3 style={dashboardStyles.title}>Total Riders</h3>
          </div>
          <div style={dashboardStyles.value}>{stats.totalRiders}</div>
          <p style={dashboardStyles.subtitle}>Registered passengers</p>
        </div>

        <div style={dashboardStyles.card}>
            <div style={dashboardStyles.cardHeader}>
            <span style={dashboardStyles.icon}>🗺️</span>
            <h3 style={dashboardStyles.title}>Locations</h3>
          </div>
          <div style={dashboardStyles.value}>{stats.totalLocations}</div>
          <p style={dashboardStyles.subtitle}>Bus stop locations</p>
        </div>
      </div>
      
      <div style={dashboardStyles.paymentSummary}>
        <h3 style={dashboardStyles.sectionTitle}>Payment Summary</h3>
        
        <div style={dashboardStyles.statusCard}>
          <div style={dashboardStyles.statusLabel}>
            <div style={{
              ...dashboardStyles.statusIcon,
              backgroundColor: colors.status.success
            }}>✓</div>
            Paid Subscriptions
          </div>
          <div style={{
            ...dashboardStyles.statusValue,
            color: colors.status.success
          }}>{paymentStats.paid}</div>
        </div>
        
        <div style={dashboardStyles.statusCard}>
          <div style={dashboardStyles.statusLabel}>
            <div style={{
              ...dashboardStyles.statusIcon,
              backgroundColor: colors.status.warning
            }}>⌛</div>
            Pending Payments
          </div>
          <div style={{
            ...dashboardStyles.statusValue,
            color: colors.status.warning
          }}>{paymentStats.pending}</div>
        </div>
        
        <div style={dashboardStyles.statusCard}>
          <div style={dashboardStyles.statusLabel}>
            <div style={{
              ...dashboardStyles.statusIcon,
              backgroundColor: colors.status.error
            }}>!</div>
            Unpaid Subscriptions
            </div>
          <div style={{
            ...dashboardStyles.statusValue,
            color: colors.status.error
          }}>{paymentStats.unpaid}</div>
          </div>
      </div>
      
      <div style={dashboardStyles.recentActivity}>
        <h3 style={dashboardStyles.sectionTitle}>Recent Activity</h3>
        
        {activities.length > 0 ? activities.map((activity, index) => (
          <div key={`${activity.id}-${index}`} style={dashboardStyles.activityItem}>
            <div style={dashboardStyles.activityIcon}>
              {activity.icon}
            </div>
            <div style={dashboardStyles.activityContent}>
              <h4 style={dashboardStyles.activityTitle}>{activity.title}</h4>
              <p style={dashboardStyles.activityTime}>{activity.formattedTime}</p>
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