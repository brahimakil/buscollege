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
  noData: {
    padding: spacing.xl,
    textAlign: 'center',
    color: colors.text.secondary
  },
  busAssignment: {
    display: 'inline-block',
    margin: '2px 4px 2px 0',
    padding: '3px 8px',
    backgroundColor: colors.primary.light,
    color: colors.text.light,
    borderRadius: '4px',
    fontSize: '0.85rem'
  }
};

const DriversList = ({ drivers, onEdit, onDelete }) => {
  const [allBuses, setAllBuses] = useState([]);
  const [driverBusMap, setDriverBusMap] = useState({});

  // Fetch all buses and find driver assignments
  useEffect(() => {
    const fetchAllBuses = async () => {
      try {
        const result = await getAllBuses();
        if (result.buses) {
          setAllBuses(result.buses);
          
          // Create a map of driver IDs to their assigned buses
          const busMap = {};
          
          // Go through each bus and check its driver
          result.buses.forEach(bus => {
            if (bus.driverId) {
              if (!busMap[bus.driverId]) {
                busMap[bus.driverId] = [];
              }
              
              busMap[bus.driverId].push({
                busId: bus.id,
                busName: bus.busName
              });
            }
          });
          
          setDriverBusMap(busMap);
          console.log("Driver to bus mapping created:", busMap);
        }
      } catch (error) {
        console.error("Error fetching buses:", error);
      }
    };
    
    fetchAllBuses();
  }, []);
  
  if (!drivers || drivers.length === 0) {
    return (
      <div style={styles.tableContainer}>
        <div style={styles.noData}>No drivers found. Add a new driver to get started.</div>
      </div>
    );
  }
  
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Name</th>
            <th style={styles.tableHeader}>Email</th>
            <th style={styles.tableHeader}>Phone</th>
            <th style={styles.tableHeader}>License</th>
            <th style={styles.tableHeader}>Bus Assignments</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => {
            // Get buses from our mapping which is based on each bus's driverId
            const assignedBuses = driverBusMap[driver.id] || [];
            
            return (
              <tr key={driver.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{driver.name}</td>
                <td style={styles.tableCell}>{driver.email}</td>
                <td style={styles.tableCell}>{driver.phoneNumber}</td>
                <td style={styles.tableCell}>{driver.licenseNumber}</td>
                <td style={styles.tableCell}>
                  {assignedBuses.length > 0 ? (
                    <div>
                      {assignedBuses.map((bus, index) => (
                        <span key={index} style={styles.busAssignment}>
                          {bus.busName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span>None</span>
                  )}
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.actions}>
                    <button 
                      style={{...styles.actionButton, ...styles.editButton}}
                      onClick={() => onEdit(driver)}
                    >
                      Edit
                    </button>
                    <button 
                      style={{...styles.actionButton, ...styles.deleteButton}}
                      onClick={() => onDelete(driver.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DriversList; 