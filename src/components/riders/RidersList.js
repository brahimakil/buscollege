import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, shadows, borderRadius } from '../../themes/theme';
import { getAllBuses } from '../../services/busService';

const styles = {
  tableContainer: {
    width: '100%',
    overflow: 'auto',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    boxShadow: shadows.sm,
    marginTop: spacing.lg
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    textAlign: 'left',
    padding: spacing.md,
    borderBottom: `2px solid ${colors.border.main}`,
    color: colors.text.primary,
    fontWeight: typography.fontWeightMedium,
    backgroundColor: colors.background.default
  },
  tableCell: {
    padding: spacing.md,
    borderBottom: `1px solid ${colors.border.light}`,
    color: colors.text.primary
  },
  tableRow: {
    '&:hover': {
      backgroundColor: colors.background.default
    }
  },
  actions: {
    display: 'flex',
    gap: spacing.sm
  },
  actionButton: {
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.sm,
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: typography.fontWeightMedium,
    cursor: 'pointer'
  },
  editButton: {
    backgroundColor: colors.secondary.main,
    color: colors.text.light
  },
  deleteButton: {
    backgroundColor: colors.status.error,
    color: colors.text.light
  },
  viewButton: {
    backgroundColor: colors.primary.main,
    color: colors.text.light
  },
  badge: {
    display: 'inline-block',
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: '50px',
    fontSize: '0.75rem',
    fontWeight: typography.fontWeightMedium,
    marginRight: spacing.xs,
    color: colors.text.light
  },
  perRideBadge: {
    backgroundColor: colors.secondary.main
  },
  monthlyBadge: {
    backgroundColor: colors.primary.main
  },
  paidBadge: {
    backgroundColor: colors.status.success
  },
  unpaidBadge: {
    backgroundColor: colors.status.error
  },
  pendingBadge: {
    backgroundColor: colors.status.warning
  },
  noData: {
    padding: spacing.xl,
    textAlign: 'center',
    color: colors.text.secondary
  },
  noneBadge: {
    backgroundColor: colors.text.secondary
  }
};

const RidersList = ({ riders, onEdit, onDelete, onViewDetails }) => {
  const [busesState, setBusesState] = useState([]);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const { buses } = await getAllBuses();
        if (buses) {
          setBusesState(buses);
        }
      } catch (error) {
        console.error("Error fetching buses:", error);
      }
    };
    
    fetchBuses();
  }, []);

  if (!riders || riders.length === 0) {
    return (
      <div style={styles.tableContainer}>
        <div style={styles.noData}>No riders found. Add a new rider to get started.</div>
      </div>
    );
  }
  
  const getBusName = (busId) => {
    const bus = busesState.find(b => b.id === busId);
    return bus ? bus.busName : 'Unknown';
  };

  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Name</th>
            <th style={styles.tableHeader}>Email</th>
            <th style={styles.tableHeader}>Phone</th>
            <th style={styles.tableHeader}>Subscription</th>
            <th style={styles.tableHeader}>Payment Status</th>
            <th style={styles.tableHeader}>Bus Assignments</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {riders.map((rider) => (
            <tr key={rider.id} style={styles.tableRow}>
              <td style={styles.tableCell}>{rider.name || rider.fullName || 'N/A'}</td>
              <td style={styles.tableCell}>{rider.email || 'N/A'}</td>
              <td style={styles.tableCell}>{rider.phoneNumber || 'N/A'}</td>
              <td style={styles.tableCell}>
                {rider.busAssignments && rider.busAssignments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {rider.busAssignments.map((assignment, index) => {
                      if (!assignment || typeof assignment !== 'object') {
                        return null;
                      }
                      
                      return (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '5px',
                          marginBottom: spacing.xs
                        }}>
                          <span style={{
                            ...styles.badge,
                            ...(assignment.subscriptionType === 'monthly' ? styles.monthlyBadge : 
                               assignment.subscriptionType === 'per_ride' ? styles.perRideBadge : styles.noneBadge)
                          }}>
                            {assignment.subscriptionType === 'monthly' ? 'Monthly' : 
                             assignment.subscriptionType === 'per_ride' ? 'Per Ride' : 'None'}
                          </span>
                          {assignment.busId && (
                            <span style={{fontSize: '0.75rem'}}>
                              ({getBusName(assignment.busId)})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span style={{...styles.badge, ...styles.noneBadge}}>None</span>
                )}
              </td>
              <td style={styles.tableCell}>
                {rider.busAssignments && rider.busAssignments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {rider.busAssignments.map((assignment, index) => {
                      if (!assignment || typeof assignment !== 'object') {
                        return null;
                      }
                      
                      return (
                        <span key={index} style={{
                          ...styles.badge,
                          ...(assignment.paymentStatus === 'paid' ? styles.paidBadge : 
                             assignment.paymentStatus === 'pending' ? styles.pendingBadge : styles.unpaidBadge)
                        }}>
                          {assignment.paymentStatus ? 
                            assignment.paymentStatus.charAt(0).toUpperCase() + assignment.paymentStatus.slice(1) : 
                            'Unpaid'}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span style={{...styles.badge, ...styles.unpaidBadge}}>Unpaid</span>
                )}
              </td>
              <td style={styles.tableCell}>
                {rider.busAssignments && Array.isArray(rider.busAssignments) ? 
                  `${rider.busAssignments.length} bus(es)` : 'None'}
              </td>
              <td style={styles.tableCell}>
                <div style={styles.actions}>
                  <button 
                    style={{...styles.actionButton, ...styles.viewButton}}
                    onClick={() => onViewDetails && onViewDetails(rider)}
                  >
                    View Details
                  </button>
                  <button 
                    style={{...styles.actionButton, ...styles.editButton}}
                    onClick={() => onEdit(rider)}
                  >
                    Edit
                  </button>
                  <button 
                    style={{...styles.actionButton, ...styles.deleteButton}}
                    onClick={() => onDelete(rider.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RidersList;