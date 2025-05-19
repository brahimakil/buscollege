import { colors, spacing, typography, shadows, borderRadius } from '../../themes/theme';
// import { updateBusRiders } from '../../services/busService';
// import { updateRiderBusPaymentStatus, updateRiderBusSubscription } from '../../services/riderService';
import React, { useState } from 'react';
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
  if (!bus || !bus.locations || !locationId) return "Not selected";
  
  // Try to find by direct ID match or prefixed format
  const location = bus.locations.find(loc => 
    (loc.id === locationId) || 
    (`loc-${loc.id}` === locationId) ||
    (loc.id === parseInt(locationId.replace('loc-', ''))) ||
    (index => `loc-${index}` === locationId)
  );
  
  return location ? location.name : "Location not found";
};

const BusDetails = ({ 
  bus, 
  riders, 
  onAssignRider, 
  onRemoveRider, 
  onUpdateRider,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('details');
  
  const currentRiders = bus.currentRiders || [];
  const currentRiderIds = currentRiders.map(rider => rider.id);
  
  const [riderToAssign, setRiderToAssign] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState('per_ride');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // State for editing riders
  const [editingRider, setEditingRider] = useState(null);
  const [editedValues, setEditedValues] = useState({
    paymentStatus: '',
    subscriptionType: ''
  });
  
  const handleAssignRider = (rider, subscription) => {
    if (onAssignRider) {
      onAssignRider(rider, subscription);
    }
  };
  
  const handleRemoveRider = (riderId) => {
    if (onRemoveRider) {
      onRemoveRider(riderId);
    }
  };
  
  // Handler for starting to edit a rider
  const handleEditRider = (rider) => {
    setEditingRider(rider.id);
    setEditedValues({
      paymentStatus: rider.paymentStatus || 'unpaid',
      subscriptionType: rider.subscriptionType || 'per_ride'
    });
  };
  
  // Handler for saving rider changes
  const handleSaveRiderChanges = async (riderId) => {
    try {
      if (onUpdateRider) {
        // Use the prop function to update the rider
        await onUpdateRider(riderId, {
          paymentStatus: editedValues.paymentStatus,
          subscriptionType: editedValues.subscriptionType
        });
        
        // Reset editing state after successful update
        setEditingRider(null);
        setEditedValues({
          paymentStatus: '',
          subscriptionType: ''
        });
      } else {
        throw new Error("Update handler not available");
      }
    } catch (error) {
      toast.error("Failed to update rider: " + error.message);
      console.error("Error updating rider:", error);
    }
  };
  
  // Handler for changing edited values
  const handleEditValueChange = (field, value) => {
    setEditedValues({
      ...editedValues,
      [field]: value
    });
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingRider(null);
    setEditedValues({
      paymentStatus: '',
      subscriptionType: ''
    });
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{bus.busName}</h2>
          {bus.busLabel && <p style={styles.subtitle}>{bus.busLabel}</p>}
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
      
      <div style={styles.tabs}>
        <div 
          style={{
            ...styles.tab,
            ...(activeTab === 'details' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('details')}
        >
          Bus Details
        </div>
        <div 
          style={{
            ...styles.tab,
            ...(activeTab === 'riders' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('riders')}
        >
          Manage Riders
        </div>
      </div>
      
      {activeTab === 'details' && (
        <>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>General Information</h3>
            <div style={styles.grid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Driver</div>
                <div style={styles.infoValue}>{bus.driverName || 'Unassigned'}</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Working Days</div>
                <div style={styles.infoValue}>{convertWorkingDaysToDisplay(bus.workingDays)}</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Operating Hours</div>
                <div style={styles.infoValue}>
                  {bus.operatingTimeFrom && bus.operatingTimeTo
                    ? `${formatTime(bus.operatingTimeFrom)} - ${formatTime(bus.operatingTimeTo)}`
                    : 'Not set'
                  }
                </div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Pricing</div>
                <div style={styles.infoValue}>
                  <div>Per ride: ${bus.pricePerRide}</div>
                  <div>Monthly: ${bus.pricePerMonth}</div>
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
                    width: `${(bus.currentRiders?.length || 0) / (bus.maxCapacity || 1) * 100}%`,
                    backgroundColor: getCapacityColor(bus.currentRiders || [], bus.maxCapacity || 1)
                  }}
                />
              </div>
              <span style={styles.capacityText}>
                {bus.currentRiders ? bus.currentRiders.length : 0}/{bus.maxCapacity || 0}
              </span>
            </div>
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Route Locations</h3>
            {bus.locations && bus.locations.length > 0 ? (
              bus.locations.map((location, index) => (
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
      
      {activeTab === 'riders' && (
        <div style={styles.tabContent}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Current Riders</h3>
            {currentRiders.length > 0 ? (
              <div style={styles.riderList}>
                {currentRiders.map(rider => {
                  const locationName = getLocationName(bus, rider.locationId);
                  const isEditing = editingRider === rider.id;
                  
                  return (
                    <div key={rider.id} style={styles.riderItem}>
                      <div style={{width: '100%'}}>
                        <div style={{fontWeight: typography.fontWeightMedium}}>{rider.name}</div>
                        <div style={{fontSize: '0.85rem', color: colors.text.secondary}}>{rider.email}</div>
                        
                        {/* Payment and subscription display/edit section */}
                        {isEditing ? (
                          <div style={styles.manageRow}>
                            <div style={styles.managePayment}>
                              <span>Subscription:</span>
                              <select 
                                value={editedValues.subscriptionType}
                                onChange={(e) => handleEditValueChange('subscriptionType', e.target.value)}
                                style={styles.subscriptionSelect}
                              >
                                <option value="per_ride">Daily (${parseFloat(bus.pricePerRide || 0).toFixed(2)})</option>
                                <option value="monthly">Monthly (${parseFloat(bus.pricePerMonth || 0).toFixed(2)})</option>
                              </select>
                            </div>
                            
                            <div style={styles.managePayment}>
                              <span>Payment Status:</span>
                              <select 
                                value={editedValues.paymentStatus}
                                onChange={(e) => handleEditValueChange('paymentStatus', e.target.value)}
                                style={styles.paymentSelect}
                              >
                                <option value="unpaid">Unpaid</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                              </select>
                            </div>
                            
                            <div style={{display: 'flex', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.xs}}>
                              <button 
                                style={{
                                  padding: `${spacing.xs} ${spacing.sm}`,
                                  backgroundColor: colors.text.secondary,
                                  color: colors.text.light,
                                  border: 'none',
                                  borderRadius: borderRadius.sm,
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                              <button 
                                style={{
                                  padding: `${spacing.xs} ${spacing.sm}`,
                                  backgroundColor: colors.secondary.main,
                                  color: colors.text.light,
                                  border: 'none',
                                  borderRadius: borderRadius.sm,
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleSaveRiderChanges(rider.id)}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{display: 'flex', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs}}>
                            {/* Subscription badge */}
                            <span style={{
                              display: 'inline-block',
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.sm,
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              backgroundColor: rider.subscriptionType === 'monthly' ? colors.status.success : colors.primary.main,
                              color: '#fff'
                            }}>
                              {rider.subscriptionType === 'monthly' ? 'Monthly' : 'Daily'}
                            </span>
                            
                            {/* Payment status badge */}
                            <span style={{
                              display: 'inline-block',
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.sm,
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              backgroundColor: rider.paymentStatus === 'paid' ? colors.status.success : 
                                              rider.paymentStatus === 'pending' ? colors.status.warning : colors.status.error,
                              color: '#fff'
                            }}>
                              {rider.paymentStatus ? rider.paymentStatus.charAt(0).toUpperCase() + rider.paymentStatus.slice(1) : 'Unpaid'}
                            </span>
                            
                            {/* Edit button */}
                            <button
                              style={{
                                padding: `${spacing.xs} ${spacing.sm}`,
                                backgroundColor: colors.secondary.main,
                                color: colors.text.light,
                                border: 'none',
                                borderRadius: borderRadius.sm,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                marginLeft: 'auto'
                              }}
                              onClick={() => handleEditRider(rider)}
                            >
                              Edit Payment
                            </button>
                          </div>
                        )}
                        
                        {/* Location information */}
                        {rider.locationId && (
                          <div style={{marginTop: spacing.xs, fontSize: '0.85rem'}}>
                            <strong>Location:</strong> {locationName}
                          </div>
                        )}
                      </div>
                      
                      <button
                        style={{...styles.actionButton, ...styles.removeButton}}
                        onClick={() => handleRemoveRider(rider.id)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No riders currently assigned to this bus.</p>
            )}
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Available Riders</h3>
            <div style={styles.riderList}>
              {riders && riders.length > 0 ? (
                riders
                  .filter(rider => !currentRiderIds.includes(rider.id))
                  .map(rider => (
                    <div key={rider.id} style={styles.riderItem}>
                      <div>
                        <div style={{fontWeight: typography.fontWeightMedium}}>{rider.name}</div>
                        <div style={{fontSize: '0.85rem', color: colors.text.secondary}}>{rider.email}</div>
                      </div>
                      <button
                        style={{...styles.actionButton, ...styles.assignButton}}
                        onClick={() => {
                          setRiderToAssign(rider);
                          setShowSubscriptionModal(true);
                        }}
                        disabled={currentRiders.length >= bus.maxCapacity}
                      >
                        Assign
                      </button>
                    </div>
                  ))
              ) : (
                <p>No available riders to assign.</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Subscription Type Modal */}
      {showSubscriptionModal && riderToAssign && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: colors.background.paper,
            padding: spacing.xl,
            borderRadius: borderRadius.md,
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3 style={{marginTop: 0}}>Select Subscription Type</h3>
            <p>Choose a subscription type for <strong>{riderToAssign.name}</strong>:</p>
            
            <div style={{marginBottom: spacing.lg}}>
              <label style={{
                display: 'block',
                marginBottom: spacing.sm,
                cursor: 'pointer',
                padding: spacing.sm,
                border: `1px solid ${subscriptionType === 'per_ride' ? colors.primary.main : colors.border.main}`,
                borderRadius: borderRadius.sm,
                backgroundColor: subscriptionType === 'per_ride' ? colors.primary.light : 'transparent'
              }}>
                <input
                  type="radio"
                  name="subscriptionType"
                  value="per_ride"
                  checked={subscriptionType === 'per_ride'}
                  onChange={() => setSubscriptionType('per_ride')}
                  style={{marginRight: spacing.sm}}
                />
                Daily (${parseFloat(bus.pricePerRide || 0).toFixed(2)} per day)
              </label>
              
              <label style={{
                display: 'block',
                cursor: 'pointer',
                padding: spacing.sm,
                border: `1px solid ${subscriptionType === 'monthly' ? colors.primary.main : colors.border.main}`,
                borderRadius: borderRadius.sm,
                backgroundColor: subscriptionType === 'monthly' ? colors.primary.light : 'transparent'
              }}>
                <input
                  type="radio"
                  name="subscriptionType"
                  value="monthly"
                  checked={subscriptionType === 'monthly'}
                  onChange={() => setSubscriptionType('monthly')}
                  style={{marginRight: spacing.sm}}
                />
                Monthly Subscription (${parseFloat(bus.pricePerMonth || 0).toFixed(2)} per month)
              </label>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: spacing.md
            }}>
              <button
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: colors.text.secondary,
                  color: colors.text.light,
                  border: 'none',
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowSubscriptionModal(false);
                  setRiderToAssign(null);
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: colors.primary.main,
                  color: colors.text.light,
                  border: 'none',
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  handleAssignRider(riderToAssign, subscriptionType);
                  setShowSubscriptionModal(false);
                  setRiderToAssign(null);
                }}
              >
                Assign Rider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusDetails; 