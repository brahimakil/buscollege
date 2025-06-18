import { colors, spacing, typography, shadows, borderRadius } from '../../themes/theme';
// import { updateBusRiders } from '../../services/busService';
// import { updateRiderBusPaymentStatus, updateRiderBusSubscription } from '../../services/riderService';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const styles = {
  container: {
    backgroundColor: colors.background.paper,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    boxShadow: shadows.sm
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottom: `1px solid ${colors.border.light}`
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: typography.fontWeightBold,
    color: colors.text.primary,
    margin: 0
  },
  subtitle: {
    fontSize: '1rem',
    color: colors.text.secondary,
    marginTop: spacing.xs
  },
  section: {
    marginBottom: spacing.xl
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: typography.fontWeightMedium,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottom: `1px solid ${colors.border.light}`
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: spacing.lg
  },
  infoItem: {
    marginBottom: spacing.md
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: colors.text.secondary,
    marginBottom: spacing.xs
  },
  infoValue: {
    fontSize: '1rem',
    color: colors.text.primary
  },
  locationCard: {
    padding: spacing.md,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    display: 'flex',
    alignItems: 'center'
  },
  locationOrder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: colors.primary.main,
    color: colors.text.light,
    fontWeight: 'bold',
    marginRight: spacing.md
  },
  locationInfo: {
    flex: 1
  },
  locationName: {
    fontSize: '1rem',
    fontWeight: typography.fontWeightMedium,
    color: colors.text.primary
  },
  locationTime: {
    fontSize: '0.85rem',
    color: colors.text.secondary
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
  tabs: {
    display: 'flex',
    borderBottom: `1px solid ${colors.border.light}`,
    marginBottom: spacing.lg
  },
  tab: {
    padding: `${spacing.sm} ${spacing.lg}`,
    cursor: 'pointer',
    fontSize: '1rem',
    color: colors.text.secondary,
    borderBottom: '2px solid transparent'
  },
  activeTab: {
    color: colors.primary.main,
    borderBottomColor: colors.primary.main
  },
  riderList: {
    marginTop: spacing.md
  },
  riderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm
  },
  actionButton: {
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.sm,
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: typography.fontWeightMedium,
    cursor: 'pointer'
  },
  assignButton: {
    backgroundColor: colors.secondary.main,
    color: colors.text.light
  },
  removeButton: {
    backgroundColor: colors.status.error,
    color: colors.text.light
  },
  capacityContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: `${spacing.md} 0`,
    backgroundColor: colors.background.default,
    padding: spacing.md,
    borderRadius: borderRadius.sm
  },
  progressContainer: {
    flex: 1,
    height: '12px',
    backgroundColor: colors.border.light,
    borderRadius: '6px',
    overflow: 'hidden',
    marginRight: spacing.md,
    marginLeft: spacing.md
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.status.success
  },
  capacityText: {
    fontSize: '1rem',
    fontWeight: typography.fontWeightMedium
  },
  tabContent: {
    marginTop: spacing.xl
  },
  paymentSelect: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.main}`,
    backgroundColor: 'white',
    fontSize: '0.85rem',
    marginLeft: spacing.sm
  },
  subscriptionSelect: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.main}`,
    backgroundColor: 'white',
    fontSize: '0.85rem',
    marginLeft: spacing.sm
  },
  manageRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  managePayment: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: '0.85rem',
  },
  saveButton: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    border: 'none',
    fontSize: '0.8rem',
    backgroundColor: colors.secondary.main,
    color: colors.text.light,
    cursor: 'pointer',
    marginLeft: 'auto'
  },
  ridersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md
  },
  riderCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.sm
  },
  riderInfo: {
    flex: 1
  },
  riderActions: {
    display: 'flex',
    gap: spacing.md
  },
  editButton: {
    padding: `${spacing.xs} ${spacing.sm}`,
    backgroundColor: colors.secondary.main,
    color: colors.text.light,
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: colors.background.paper,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    width: '400px',
    maxWidth: '90%'
  },
  formGroup: {
    marginBottom: spacing.lg
  },
  select: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.main}`,
    backgroundColor: 'white',
    fontSize: '0.85rem',
    marginLeft: spacing.sm
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spacing.md
  },
  cancelButton: {
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: colors.text.secondary,
    color: colors.text.light,
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: spacing.md
  },
  tabButton: {
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: `2px solid transparent`,
    cursor: 'pointer',
    fontSize: '1rem'
  },
  activeTab: {
    borderBottom: `2px solid ${colors.primary.main}`,
    fontWeight: 'bold'
  },
  tabContent: {
    padding: `${spacing.md} 0`
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

const getLocationName = (bus, locationId) => {
  if (!locationId) return "Not selected";
  
  // If locationId is already a location name (string), return it directly
  if (typeof locationId === 'string' && !locationId.startsWith('loc-')) {
    return locationId;
  }
  
  // Otherwise, try to find by ID in bus locations
  if (!bus || !bus.locations) return locationId || "Unknown location";
  
  const location = bus.locations.find(loc => 
    (loc.id === locationId) || 
    (`loc-${loc.id}` === locationId) ||
    (loc.name === locationId)
  );
  
  return location ? location.name : locationId || "Unknown location";
};

const BusDetails = ({ 
  bus: initialBus, 
  riders, 
  onRemoveRider, 
  onUpdateRider, 
  onClose 
}) => {
  const [localBus, setLocalBus] = useState(initialBus);
  const [activeTab, setActiveTab] = useState('details');
  
  // Process current riders to ensure they have complete data
  const processCurrentRiders = (currentRiders, allRiders) => {
    return currentRiders.map(rider => {
      // If it's already a full object with name and email, preserve all data
      if (typeof rider === 'object' && rider !== null && rider.name && rider.email) {
        return {
          ...rider, // This preserves locationId, assignedAt, etc.
        };
      }
      
      const riderId = typeof rider === 'string' ? rider : rider.id;
      const riderInfo = allRiders.find(r => r.id === riderId);
      
      if (riderInfo) {
        // Try to get location and time from rider's busAssignments
        let locationId = null;
        let assignedAt = null;
        
        if (riderInfo.busAssignments && Array.isArray(riderInfo.busAssignments)) {
          const busAssignment = riderInfo.busAssignments.find(assignment => 
            assignment.busId === localBus.id
          );
          if (busAssignment) {
            locationId = busAssignment.locationId;
            assignedAt = busAssignment.assignedAt;
          }
        }
        
        return {
          id: riderId,
          name: riderInfo.name,
          email: riderInfo.email,
          // PRESERVE existing data from the rider object if it exists, otherwise use from busAssignments
          paymentStatus: (typeof rider === 'object' && rider.paymentStatus) ? 
                        rider.paymentStatus : 
                        'unpaid',
          subscriptionType: (typeof rider === 'object' && rider.subscriptionType) ?
                           rider.subscriptionType :
                           'per_ride',
          locationId: (typeof rider === 'object' && rider.locationId) ?
                     rider.locationId :
                     locationId,
          assignedAt: (typeof rider === 'object' && rider.assignedAt) ?
                     rider.assignedAt :
                     assignedAt
        };
      }
      
      // If we can't find the rider data, return a placeholder
      return {
        id: riderId,
        name: 'Unknown User',
        email: 'No email available',
        paymentStatus: (typeof rider === 'object' && rider.paymentStatus) ? 
                      rider.paymentStatus : 
                      'unpaid',
        subscriptionType: (typeof rider === 'object' && rider.subscriptionType) ?
                           rider.subscriptionType :
                           'per_ride',
        locationId: (typeof rider === 'object' && rider.locationId) ?
                     rider.locationId :
                     null,
        assignedAt: (typeof rider === 'object' && rider.assignedAt) ?
                     rider.assignedAt :
                     null
      };
    });
  };
  
  const currentRiders = processCurrentRiders(localBus.currentRiders || [], riders);
  const currentRiderIds = currentRiders.map(rider => rider.id);
  
  // State for editing riders
  const [editingRider, setEditingRider] = useState(null);
  const [editedValues, setEditedValues] = useState({
    paymentStatus: '' // Only payment status remains
  });

  // Handler for starting to edit a rider
  const handleEditRider = (rider) => {
    setEditingRider(rider.id);
    setEditedValues({
      paymentStatus: rider.paymentStatus || 'unpaid'
    });
  };
  
  // Handler for saving rider edits
  const handleSaveRiderChanges = async () => {
    if (!editingRider || !onUpdateRider) return;
    
    try {
      // Only update payment status
      await onUpdateRider(editingRider, { paymentStatus: editedValues.paymentStatus });
      
      // Update local state immediately
      setLocalBus(prev => {
        const updatedRiders = (prev.currentRiders || []).map(rider => {
          if (rider.id === editingRider) {
            return {
              ...rider,
              paymentStatus: editedValues.paymentStatus
            };
          }
          return rider;
        });
        
        return {
          ...prev,
          currentRiders: updatedRiders
        };
      });
      
      setEditingRider(null);
      toast.success("Rider payment status updated");
    } catch (error) {
      toast.error(`Error updating rider: ${error.message}`);
      console.error("Error updating rider:", error);
    }
  };

  // Handle rider removal with proper state update
  const handleRemoveRider = (riderId) => {
    if (onRemoveRider) {
      // Call the parent removal function
      onRemoveRider(riderId);
      
      // Update local state immediately
      setLocalBus(prev => {
        const updatedRiders = (prev.currentRiders || []).filter(
          rider => (typeof rider === 'object' ? rider.id : rider) !== riderId
        );
        
        return {
          ...prev,
          currentRiders: updatedRiders
        };
      });
    }
  };
  
  // Add helper function to format subscription time
  const formatSubscriptionTime = (assignedAt) => {
    if (!assignedAt) return 'Unknown';
    
    try {
      const date = new Date(assignedAt);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{localBus.busName}</h2>
          {localBus.busLabel && <p style={styles.subtitle}>{localBus.busLabel}</p>}
        </div>
        <button 
          style={{
            padding: `${spacing.xs} ${spacing.md}`,
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.text.secondary,
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      {/* Add tab navigation */}
      <div style={styles.tabContainer}>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'details' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('details')}
        >
          Bus Details
        </button>
        
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'riders' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('riders')}
        >
          Riders
        </button>
      </div>
      
      {/* Bus Details Tab */}
      {activeTab === 'details' && (
        <>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>General Information</h3>
            <div style={styles.grid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Driver</div>
                <div style={styles.infoValue}>{localBus.driverName || 'Unassigned'}</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Working Days</div>
                <div style={styles.infoValue}>{convertWorkingDaysToDisplay(localBus.workingDays)}</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Operating Hours</div>
                <div style={styles.infoValue}>
                  {localBus.operatingTimeFrom && localBus.operatingTimeTo
                    ? `${formatTime(localBus.operatingTimeFrom)} - ${formatTime(localBus.operatingTimeTo)}`
                    : 'Not set'
                  }
                </div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Pricing</div>
                <div style={styles.infoValue}>
                  <div>Per ride: ${localBus.pricePerRide}</div>
                  <div>Monthly: ${localBus.pricePerMonth}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Capacity</h3>
            <div style={styles.capacityContainer}>
              <span style={styles.capacityText}>Riders:</span>
              <div style={styles.progressContainer}>
                <div 
                  style={{
                    ...styles.progressBar,
                    width: `${(currentRiders.length) / (localBus.maxCapacity || 1) * 100}%`,
                    backgroundColor: getCapacityColor(currentRiders, localBus.maxCapacity || 1)
                  }}
                />
              </div>
              <span style={styles.capacityText}>
                {currentRiders.length}/{localBus.maxCapacity || 0}
              </span>
            </div>
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Route Locations</h3>
            {localBus.locations && localBus.locations.length > 0 ? (
              localBus.locations.map((location, index) => (
                <div key={index} style={styles.locationCard}>
                  <div style={styles.locationOrder}>{index + 1}</div>
                  <div style={styles.locationInfo}>
                    <div style={styles.locationName}>{location.name}</div>
                    <div style={styles.locationTime}>
                      Arrival time: {formatTime(location.arrivalTimeFrom)} - {formatTime(location.arrivalTimeTo)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No locations added to this route.</p>
            )}
          </div>
        </>
      )}
      
      {/* Riders Tab */}
      {activeTab === 'riders' && (
        <div style={styles.tabContent}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Current Riders</h3>
            
            {currentRiders.length === 0 ? (
              <p>No riders assigned to this bus</p>
            ) : (
              <div style={styles.ridersContainer}>
                {currentRiders.map(rider => (
                  <div key={rider.id} style={styles.riderCard}>
                    <div style={styles.riderInfo}>
                      <h4>{rider.name}</h4>
                      <p>{rider.email}</p>
                      <p>Payment: {rider.paymentStatus}</p>
                      {rider.locationId && (
                        <p style={{ fontSize: '0.9rem', color: colors.text.secondary }}>
                          Location: {getLocationName(localBus, rider.locationId)}
                        </p>
                      )}
                      {rider.assignedAt && (
                        <p style={{ fontSize: '0.9rem', color: colors.text.secondary }}>
                          Subscribed: {formatSubscriptionTime(rider.assignedAt)}
                        </p>
                      )}
                    </div>
                    
                    <div style={styles.riderActions}>
                      <button 
                        style={styles.editButton}
                        onClick={() => handleEditRider(rider)}
                      >
                        Edit
                      </button>
                      
                      <button 
                        style={styles.removeButton}
                        onClick={() => handleRemoveRider(rider.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Edit Rider Modal */}
      {editingRider && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit Rider</h3>
            
            <div style={styles.formGroup}>
              <label>Payment Status:</label>
              <select
                value={editedValues.paymentStatus}
                onChange={(e) => setEditedValues(prev => ({
                  ...prev,
                  paymentStatus: e.target.value
                }))}
                style={styles.select}
              >
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            
            <div style={styles.modalActions}>
              <button 
                style={styles.cancelButton}
                onClick={() => setEditingRider(null)}
              >
                Cancel
              </button>
              
              <button 
                style={styles.saveButton}
                onClick={handleSaveRiderChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusDetails; 