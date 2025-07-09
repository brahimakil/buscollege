import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import BusRouteMap from "../components/dashboard/BusRouteMap";
import { colors, spacing, typography, shadows, borderRadius, breakpoints } from '../themes/theme';
import { getAllBuses } from "../services/busService";
import { getAllDrivers } from "../services/driverService";
import { getAllRiders } from "../services/riderService";

// Custom Chart Components
const PieChart = ({ data, size = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) return null;
  
  let currentAngle = 0;
  
  const createArc = (value, startAngle, color) => {
    const angle = (value / total) * 360;
    const endAngle = startAngle + angle;
    
    const x1 = Math.cos((startAngle * Math.PI) / 180) * (size / 2 - 10);
    const y1 = Math.sin((startAngle * Math.PI) / 180) * (size / 2 - 10);
    const x2 = Math.cos((endAngle * Math.PI) / 180) * (size / 2 - 10);
    const y2 = Math.sin((endAngle * Math.PI) / 180) * (size / 2 - 10);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return {
      path: `M 0 0 L ${x1} ${y1} A ${size / 2 - 10} ${size / 2 - 10} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      color,
      percentage: ((value / total) * 100).toFixed(1)
    };
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {data.map((item, index) => {
          const arc = createArc(item.value, currentAngle, item.color);
          currentAngle += (item.value / total) * 360;
          return (
            <path
              key={index}
              d={arc.path}
              fill={arc.color}
              transform={`translate(${size / 2}, ${size / 2})`}
            />
          );
        })}
      </svg>
      <div>
        {data.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: spacing.sm,
            fontSize: '0.9rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: item.color,
              borderRadius: '2px',
              marginRight: spacing.sm
            }}></div>
            <span style={{ color: colors.text.primary }}>
              {item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChart = ({ data, width = 300, height = 150 }) => {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value));
  if (maxValue === 0) return null;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * (width - 40) + 20;
    const y = height - 20 - ((item.value / maxValue) * (height - 40));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <svg width={width} height={height}>
        <polyline
          points={points}
          fill="none"
          stroke={colors.primary.main}
          strokeWidth="2"
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * (width - 40) + 20;
          const y = height - 20 - ((item.value / maxValue) * (height - 40));
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={colors.primary.main}
            />
          );
        })}
        {/* X-axis labels */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * (width - 40) + 20;
          return (
            <text
              key={index}
              x={x}
              y={height - 5}
              textAnchor="middle"
              fontSize="10"
              fill={colors.text.secondary}
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const BarChart = ({ data, width = 300, height = 150 }) => {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value));
  if (maxValue === 0) return null;
  
  const barWidth = (width - 40) / data.length - 10;

  return (
    <div>
      <svg width={width} height={height}>
        {data.map((item, index) => {
          const x = 20 + index * ((width - 40) / data.length);
          const barHeight = (item.value / maxValue) * (height - 40);
          const y = height - 20 - barHeight;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color || colors.primary.main}
                rx="2"
              />
              <text
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                fontSize="10"
                fill={colors.text.secondary}
              >
                {item.label}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="10"
                fill={colors.text.primary}
                fontWeight="bold"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalDrivers: 0,
    totalRiders: 0,
    totalLocations: 0
  });
  const [paymentStats, setPaymentStats] = useState({
    paid: 0,
    pending: 0,
    unpaid: 0
  });
  const [busStatusStats, setBusStatusStats] = useState({
    active: 0,
    inactive: 0,
    maintenance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyRegistrations, setMonthlyRegistrations] = useState([]);
  const [locationDistribution, setLocationDistribution] = useState([]);
  const [activities, setActivities] = useState([]);
  const [buses, setBuses] = useState([]); // For the map

  // Responsive styles without media queries
  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: spacing.lg,
      marginBottom: spacing.xl,
    },
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      boxShadow: shadows.sm,
      transition: '0.3s ease',
    },
    chartCard: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      boxShadow: shadows.sm,
      marginTop: spacing.lg,
    },
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
      gap: spacing.lg,
      marginTop: spacing.lg,
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: spacing.md
    },
    icon: {
      fontSize: '2rem',
      marginRight: spacing.md,
      color: colors.primary.main,
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
      margin: `${spacing.sm} 0`,
    },
    subtitle: {
      fontSize: typography.fontSize,
      color: colors.text.secondary,
      margin: 0,
    },
    sectionTitle: {
      fontSize: typography.h5.fontSize,
      fontWeight: typography.fontWeightMedium,
      color: colors.text.primary,
      marginBottom: spacing.lg,
    },
    pageTitle: {
      fontSize: typography.h3.fontSize,
      marginBottom: spacing.xl,
      color: colors.text.primary,
    },
    loadingContainer: {
      textAlign: 'center',
      padding: spacing.xl,
      color: colors.text.secondary,
    },
    errorContainer: {
      textAlign: 'center',
      padding: spacing.xl,
      color: colors.status.error,
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      border: `1px solid ${colors.status.error}`,
    },
    activityItem: {
      padding: spacing.md,
      borderBottom: `1px solid ${colors.border.light}`,
      display: 'flex',
      alignItems: 'center',
    },
    activityIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: colors.primary.light,
      color: colors.text.light,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
      fontSize: '1.2rem',
    },
    activityContent: {
      flex: 1
    },
    activityTitle: {
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeightMedium,
      color: colors.text.primary,
      margin: 0,
    },
    activityTime: {
      fontSize: '0.85rem',
      color: colors.text.secondary,
      margin: 0,
    },
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const [busesResult, driversResult, ridersResult] = await Promise.all([
        getAllBuses(),
        getAllDrivers(),
        getAllRiders()
      ]);

    // Store buses for the map component
    setBuses(busesResult.buses || []);

    if (busesResult.error || driversResult.error || ridersResult.error) {
      setError("Error fetching some dashboard data");
      return;
    }

    // Calculate basic stats
    const totalBuses = busesResult.buses?.length || 0;
    const totalDrivers = driversResult.drivers?.length || 0;
    
    // Calculate total unique locations
    const locationSet = new Set();
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
    const totalLocations = locationSet.size;

    // Calculate real rider count and payment stats from currentRiders
    let totalRiders = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let unpaidCount = 0;
    const riderSet = new Set(); // To avoid counting duplicate riders

    if (busesResult.buses) {
      busesResult.buses.forEach(bus => {
        if (bus.currentRiders && Array.isArray(bus.currentRiders)) {
          bus.currentRiders.forEach(rider => {
            if (rider && typeof rider === 'object') {
              // Add to set to avoid counting duplicates
              riderSet.add(rider.id);
              
              // Count payment statuses
              const paymentStatus = rider.paymentStatus || 'unpaid';
              switch (paymentStatus.toLowerCase()) {
                case 'paid':
                  paidCount++;
                  break;
                case 'pending':
                  pendingCount++;
                  break;
                case 'unpaid':
                case 'overdue':
                default:
                  unpaidCount++;
                  break;
              }
            } else if (typeof rider === 'string') {
              // Handle string IDs - count as unpaid by default
              riderSet.add(rider);
              unpaidCount++;
            }
          });
        }
      });
    }

    totalRiders = riderSet.size;

    setStats({
      totalBuses,
      totalDrivers, 
      totalRiders,
      totalLocations
    });

    // Calculate bus status stats based on whether buses have drivers and riders
    let activeBuses = 0;
    let inactiveBuses = 0;
    let maintenanceBuses = 0;

    if (busesResult.buses) {
      busesResult.buses.forEach(bus => {
        const hasDriver = bus.driverId && bus.driverId.trim() !== '';
        const hasRiders = bus.currentRiders && bus.currentRiders.length > 0;
        
        if (hasDriver && hasRiders) {
          activeBuses++;
        } else if (hasDriver || hasRiders) {
          inactiveBuses++;
        } else {
          maintenanceBuses++;
        }
      });
    }

    setBusStatusStats({
      active: activeBuses,
      inactive: inactiveBuses,
      maintenance: maintenanceBuses
    });

    // Set real payment stats
    setPaymentStats({
      paid: paidCount,
      pending: pendingCount,
      unpaid: unpaidCount
    });

    // Calculate monthly registrations from actual rider data
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      let count = 0;
      if (ridersResult.riders) {
        ridersResult.riders.forEach(rider => {
          if (rider.createdAt) {
            const createdAt = rider.createdAt?.toDate ? rider.createdAt.toDate() : new Date(rider.createdAt);
            if (createdAt >= monthStart && createdAt <= monthEnd) {
              count++;
            }
          }
        });
      }
      
      monthlyData.push({
        label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        value: count
      });
    }
    setMonthlyRegistrations(monthlyData);

    // Calculate location distribution from buses
    const locationCounts = {};
    if (busesResult.buses) {
      busesResult.buses.forEach(bus => {
        if (bus.locations && Array.isArray(bus.locations)) {
          bus.locations.forEach(location => {
            if (location.name) {
              locationCounts[location.name] = (locationCounts[location.name] || 0) + 1;
            }
          });
        }
      });
    }

    const locationDistData = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count], index) => ({
        label: name.length > 8 ? name.substring(0, 8) + '...' : name,
        value: count,
        color: [colors.primary.main, colors.secondary.main, colors.accent.main, colors.status.warning, colors.status.info][index]
      }));

    setLocationDistribution(locationDistData);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Get recent activities from notifications in localStorage
      const notifications = JSON.parse(localStorage.getItem('buscollege_notifications') || '[]');
      
      // Convert notifications to activities format
      const recentActivities = notifications
        .slice(0, 5) // Get last 5 notifications
        .map(notification => ({
          id: notification.id,
          title: notification.message,
          icon: getActivityIcon(notification.type),
          createdAt: new Date(notification.time),
          formattedTime: formatTimeAgo(new Date(notification.time))
        }));

      setActivities(recentActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      
      // Fallback to static activities if localStorage fails
      const fallbackActivities = [
        {
          id: 1,
          title: "System initialized",
          icon: "🚀",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          formattedTime: "2 hours ago"
        }
      ];
      setActivities(fallbackActivities);
    }
  };

  const getActivityIcon = (notificationType) => {
    const iconMap = {
      'bus_created': '🚌',
      'bus_updated': '🔄',
      'bus_deleted': '🗑️',
      'rider_created': '👥',
      'rider_updated': '✏️',
      'rider_deleted': '👋',
      'driver_created': '👨‍✈️',
      'driver_updated': '🔧',
      'driver_deleted': '❌',
      'payment_updated': '💰',
      'rider_removed_from_bus': '🚫',
      'driver_removed_from_bus': '🚫'
    };
    return iconMap[notificationType] || '📝';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return `${diffSecs} seconds ago`;
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
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

  if (error) {
    return (
      <MainLayout>
        <div style={styles.errorContainer}>
          {error}
        </div>
      </MainLayout>
    );
  }

  const paymentChartData = [
    { label: 'Paid', value: paymentStats.paid, color: colors.status.success },
    { label: 'Pending', value: paymentStats.pending, color: colors.status.warning },
    { label: 'Unpaid', value: paymentStats.unpaid, color: colors.status.error }
  ].filter(item => item.value > 0);

  const busStatusChartData = [
    { label: 'Active', value: busStatusStats.active, color: colors.status.success },
    { label: 'Inactive', value: busStatusStats.inactive, color: colors.status.error },
    { label: 'Maintenance', value: busStatusStats.maintenance, color: colors.status.warning }
  ].filter(item => item.value > 0);

  return (
    <MainLayout>
      <h2 style={styles.pageTitle}>
        📊 Dashboard Overview
      </h2>
      
      {/* Main Stats Cards */}
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
          <p style={styles.subtitle}>Active bus riders</p>
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

      {/* Interactive Bus Routes Map */}
      <div style={{...styles.chartCard, marginBottom: spacing.xl}}>
        <h3 style={styles.sectionTitle}>🗺️ Interactive Bus Routes Map</h3>
        <BusRouteMap buses={buses} />
      </div>

      {/* Charts */}
      <div style={styles.twoColumnGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>💰 Payment Status Distribution</h3>
          {paymentChartData.length > 0 ? (
            <PieChart data={paymentChartData} />
          ) : (
            <p style={{ color: colors.text.secondary, textAlign: 'center', padding: spacing.lg }}>
              No payment data available
            </p>
          )}
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>🚌 Bus Status Overview</h3>
          {busStatusChartData.length > 0 ? (
            <BarChart data={busStatusChartData} />
          ) : (
            <p style={{ color: colors.text.secondary, textAlign: 'center', padding: spacing.lg }}>
              No bus data available
            </p>
          )}
        </div>
      </div>

      <div style={styles.twoColumnGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>📈 Monthly Registrations</h3>
          {monthlyRegistrations.some(m => m.value > 0) ? (
            <LineChart data={monthlyRegistrations} />
          ) : (
            <p style={{ color: colors.text.secondary, textAlign: 'center', padding: spacing.lg }}>
              No registration data for recent months
            </p>
          )}
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>📍 Top Locations</h3>
          {locationDistribution.length > 0 ? (
            <BarChart data={locationDistribution} />
          ) : (
            <p style={{ color: colors.text.secondary, textAlign: 'center', padding: spacing.lg }}>
              No location data available
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.chartCard}>
        <h3 style={styles.sectionTitle}>🕒 Recent Activity</h3>
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
          <p style={{ color: colors.text.secondary, textAlign: 'center', padding: spacing.lg }}>
            No recent activity found.
          </p>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard; 