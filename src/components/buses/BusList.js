import React from 'react';
import { colors, spacing, typography, shadows, borderRadius } from '../../themes/theme';

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
    backgroundColor: colors.primary.light,
    color: colors.text.light
  },
  noData: {
    padding: spacing.xl,
    textAlign: 'center',
    color: colors.text.secondary
  },
  capacityContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs
  },
  progressContainer: {
    flex: 1,
    height: '8px',
    backgroundColor: colors.border.light,
    borderRadius: '4px',
    overflow: 'hidden',
    marginRight: spacing.md
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.status.success
  },
  locationsList: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  locationItem: {
    marginBottom: spacing.xs,
    fontSize: '0.85rem'
  }
};

const formatTime = (time) => {
  if (!time) return '';
  
  // Convert 24-hour format to 12-hour format with AM/PM
  const timeParts = time.split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  
  return `${hours}:${minutes} ${ampm}`;
};

const getCapacityColor = (currentRiders, maxCapacity) => {
  const percentage = (currentRiders.length / maxCapacity) * 100;
  
  if (percentage >= 90) {
    return colors.status.error;
  } else if (percentage >= 70) {
    return colors.status.warning;
  } else {
    return colors.status.success;
  }
};

const convertWorkingDaysToDisplay = (workingDays) => {
  if (!workingDays) return 'N/A';
  
  const days = [];
  
  // Handle both array and object formats
  if (Array.isArray(workingDays)) {
    workingDays.forEach(day => {
      days.push(day.charAt(0).toUpperCase() + day.slice(1));
    });
  } else {
    Object.keys(workingDays).forEach(day => {
      if (workingDays[day]) {
        days.push(day.charAt(0).toUpperCase() + day.slice(1));
      }
    });
  }
  
  return days.join(', ');
};

const BusList = ({ buses, onEdit, onDelete, onViewDetails }) => {
  if (!buses || buses.length === 0) {
    return (
      <div style={styles.tableContainer}>
        <div style={styles.noData}>No buses found. Add a new bus to get started.</div>
      </div>
    );
  }
  
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Bus Name/ID</th>
            <th style={styles.tableHeader}>Driver</th>
            <th style={styles.tableHeader}>Operating Time</th>
            <th style={styles.tableHeader}>Locations</th>
            <th style={styles.tableHeader}>Working Days</th>
            <th style={styles.tableHeader}>Capacity</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buses.map(bus => (
            <tr key={bus.id} style={styles.tableRow}>
              <td style={styles.tableCell}>
                <div>
                  <strong>{bus.busName}</strong>
                  {bus.busLabel && <div style={{fontSize: '0.85rem', color: colors.text.secondary}}>{bus.busLabel}</div>}
                </div>
              </td>
              <td style={styles.tableCell}>{bus.driverName || 'Unassigned'}</td>
              <td style={styles.tableCell}>
                {bus.operatingTimeFrom && bus.operatingTimeTo
                  ? `${formatTime(bus.operatingTimeFrom)} - ${formatTime(bus.operatingTimeTo)}`
                  : 'Not set'
                }
              </td>
              <td style={styles.tableCell}>
                {bus.locations && bus.locations.length > 0 ? (
                  <ul style={styles.locationsList}>
                    {bus.locations.slice(0, 3).map((location, index) => (
                      <li key={index} style={styles.locationItem}>
                        {location.name}
                      </li>
                    ))}
                    {bus.locations.length > 3 && (
                      <li style={{...styles.locationItem, fontStyle: 'italic'}}>
                        +{bus.locations.length - 3} more locations...
                      </li>
                    )}
                  </ul>
                ) : (
                  'No locations'
                )}
              </td>
              <td style={styles.tableCell}>
                {convertWorkingDaysToDisplay(bus.workingDays)}
              </td>
              <td style={styles.tableCell}>
                <div style={styles.capacityContainer}>
                  <div style={styles.progressContainer}>
                    <div 
                      style={{
                        ...styles.progressBar,
                        width: `${(bus.currentRiders?.length || 0) / (bus.maxCapacity || 1) * 100}%`,
                        backgroundColor: getCapacityColor(bus.currentRiders || [], bus.maxCapacity || 1)
                      }}
                    />
                  </div>
                  <span>
                    {bus.currentRiders ? bus.currentRiders.length : 0}/{bus.maxCapacity || 0}
                  </span>
                </div>
              </td>
              <td style={styles.tableCell}>
                <div style={styles.actions}>
                  <button 
                    style={{...styles.actionButton, ...styles.viewButton}}
                    onClick={() => onViewDetails && onViewDetails(bus)}
                  >
                    View
                  </button>
                  <button 
                    style={{...styles.actionButton, ...styles.editButton}}
                    onClick={() => onEdit && onEdit(bus)}
                  >
                    Edit
                  </button>
                  <button 
                    style={{...styles.actionButton, ...styles.deleteButton}}
                    onClick={() => onDelete && onDelete(bus.id)}
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

export default BusList;