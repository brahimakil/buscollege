import React, { useState, useEffect, useCallback } from 'react';
import { getBusesForAssignment } from '../../services/riderService';
import { colors, spacing, typography, borderRadius } from '../../themes/theme';

// Define styles object
const styles = {
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    maxWidth: '800px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderBottom: `1px solid ${colors.border.main}`,
    paddingBottom: spacing.md
  },
  title: {
    ...typography.h3,
    margin: 0,
    color: colors.text.primary
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.text.secondary,
    fontSize: '1.2rem',
    cursor: 'pointer'
  },
  section: {
    marginBottom: spacing.xl
  },
  sectionTitle: {
    ...typography.h4,
    marginTop: 0,
    marginBottom: spacing.md,
    color: colors.text.primary
  },
  detail: {
    display: 'flex',
    marginBottom: spacing.sm
  },
  detailLabel: {
    fontWeight: 'bold',
    width: '150px',
    color: colors.text.secondary
  },
  detailValue: {
    flex: 1,
    color: colors.text.primary
  },
  busList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md
  },
  busCard: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    border: `1px solid ${colors.border.main}`,
    borderRadius: borderRadius.sm,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  busInfo: {
    flex: 1
  },
  busName: {
    fontWeight: 'bold',
    color: colors.text.primary,
    fontSize: '1.1rem'
  },
  busDetails: {
    color: colors.text.secondary,
    fontSize: '0.9rem',
    marginTop: spacing.xs
  },
  badge: {
    display: 'inline-block',
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  monthlyBadge: {
    backgroundColor: colors.status.success,
    color: '#fff'
  },
  perRideBadge: {
    backgroundColor: colors.primary.main,
    color: '#fff'
  },
  noneBadge: {
    backgroundColor: colors.text.secondary,
    color: '#fff'
  },
  paidBadge: {
    backgroundColor: colors.status.success,
    color: '#fff'
  },
  pendingBadge: {
    backgroundColor: colors.status.warning,
    color: '#fff'
  },
  unpaidBadge: {
    backgroundColor: colors.status.error,
    color: '#fff'
  },
  busCapacity: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    fontSize: '0.9rem'
  },
  capacityBar: {
    flex: 1,
    height: '8px',
    backgroundColor: colors.border.light,
    borderRadius: spacing.xs,
    overflow: 'hidden'
  },
  capacityFill: {
    height: '100%',
    borderRadius: spacing.xs
  },
  actionButton: {
    padding: `${spacing.xs} ${spacing.md}`,
    border: 'none',
    borderRadius: borderRadius.sm,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
    width: '100%'
  },
  assignButton: {
    backgroundColor: colors.primary.main,
    color: colors.text.light
  },
  editButton: {
    backgroundColor: colors.status.info,
    color: colors.text.light
  },
  removeButton: {
    backgroundColor: colors.status.error,
    color: colors.text.light
  },
  payButton: {
    backgroundColor: colors.status.success,
    color: colors.text.light
  },
  locationsList: {
    listStyle: 'none',
    padding: 0,
    margin: `${spacing.sm} 0 0 0`
  },
  locationItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.85rem',
    marginBottom: spacing.xs,
    color: colors.text.secondary
  },
  locationDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: colors.primary.main,
    marginRight: spacing.sm
  },
  error: {
    color: colors.status.error,
    fontSize: '0.85rem',
    marginTop: spacing.xs
  }
};

const RiderDetails = ({ rider, onAssignBus, onRemoveBus, onUpdatePayment, onClose }) => {
  const [buses, setBuses] = useState([]);
  const [assignedBuses, setAssignedBuses] = useState([]);
  const [unassignedBuses, setUnassignedBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState('per_ride');
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  
  const fetchBuses = useCallback(async () => {
    try {
      const result = await getBusesForAssignment();
      
      if (result.buses) {
        const fetchedBuses = result.buses;
        
        if (rider) {
          const assigned = [];
          const unassigned = [];
          
          fetchedBuses.forEach(bus => {
            const hasAssignment = rider.busAssignments && 
              Array.isArray(rider.busAssignments) ? 
              (typeof rider.busAssignments[0] === 'object' ?
                rider.busAssignments.some(assign => assign.busId === bus.id) :
                rider.busAssignments.includes(bus.id)) :
              false;
            
            if (hasAssignment) {
              assigned.push(bus);
            } else {
              if (bus.hasCapacity) {
                unassigned.push(bus);
              }
            }
          });
          
          setAssignedBuses(assigned);
          setUnassignedBuses(unassigned);
        }
      }
    } catch (error) {
      console.error("Error fetching buses:", error);
    }
  }, [rider]);
  
  useEffect(() => {
    if (rider) {
      fetchBuses();
    }
  }, [rider, fetchBuses]);
  
  const isWithinOperatingHours = (bus) => {
    if (!bus.workingDays || !bus.operatingTimeFrom || !bus.operatingTimeTo) {
      return false;
    }
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const isWorkingDay = Array.isArray(bus.workingDays) 
      ? bus.workingDays.includes(currentDay) 
      : bus.workingDays[currentDay] === true;
      
    if (!isWorkingDay) {
      return false;
    }
    
    const [fromHour, fromMinute] = bus.operatingTimeFrom.split(':').map(Number);
    const [toHour, toMinute] = bus.operatingTimeTo.split(':').map(Number);
    
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const fromTimeInMinutes = fromHour * 60 + fromMinute;
    const toTimeInMinutes = toHour * 60 + toMinute;
    
    return currentTimeInMinutes >= fromTimeInMinutes && currentTimeInMinutes <= toTimeInMinutes;
  };
  
  const handleAssignBus = async () => {
    if (!onAssignBus || !selectedBus || !selectedLocationId) return;
    
    try {
      const subType = subscriptionType === 'none' ? 'per_ride' : subscriptionType;
      
      await onAssignBus(rider.id, selectedBus.id, subType, selectedLocationId);
      
      setShowSubscriptionModal(false);
      setSelectedBus(null);
      setSelectedLocationId(null);
      
      fetchBuses();
    } catch (error) {
      console.error("Error handling bus assignment:", error);
    }
  };
  
  const handleRemoveBus = async (busId) => {
    if (onRemoveBus) {
      try {
        await onRemoveBus(rider.id, busId);
        await fetchBuses();
      } catch (error) {
        console.error("Error removing bus subscription:", error);
      }
    }
  };
  
  const handleUpdatePayment = (busId, status) => {
    if (onUpdatePayment) {
      onUpdatePayment(rider.id, busId, status);
    }
  };
  
  if (!rider) return null;
  
  const getBusAssignment = (busId) => {
    if (!rider.busAssignments) return { 
      busId, 
      subscriptionType: 'none', 
      paymentStatus: 'unpaid' 
    };
    
    if (Array.isArray(rider.busAssignments)) {
      if (rider.busAssignments.length > 0 && typeof rider.busAssignments[0] === 'object') {
        const assignment = rider.busAssignments.find(a => a.busId === busId);
        return assignment || { 
          busId, 
          subscriptionType: 'none', 
          paymentStatus: 'unpaid' 
        };
      } else {
        return rider.busAssignments.includes(busId) ? { 
          busId, 
          subscriptionType: 'none', 
          paymentStatus: 'unpaid' 
        } : { 
          busId, 
          subscriptionType: 'none', 
          paymentStatus: 'unpaid' 
        };
      }
    } else {
      return { 
        busId, 
        subscriptionType: 'none', 
        paymentStatus: 'unpaid' 
      };
    }
  };
  
  const getLocationName = (bus, locationId) => {
    if (!bus || !bus.locations || !locationId) return "Not selected";
    
    const location = bus.locations.find(loc => 
      (loc.id === locationId) || 
      (`loc-${loc.id}` === locationId) ||
      (loc.id === parseInt(locationId.replace('loc-', ''))) ||
      (index => `loc-${index}` === locationId)
    );
    
    return location ? location.name : "Location data unavailable";
  };
  
  const busAssignment = getBusAssignment(selectedBus.id) || { 
    subscriptionType: 'none', 
    paymentStatus: 'unpaid',
    locationId: null
  };
  
  const canEdit = !isWithinOperatingHours(selectedBus);
  if (canEdit) {
    console.log("Bus can be edited", selectedBus.id);
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Rider Details</h2>
        <button style={styles.closeButton} onClick={onClose}>&times;</button>
      </div>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Personal Information</h3>
        <div style={styles.detail}>
          <div style={styles.detailLabel}>Name:</div>
          <div style={styles.detailValue}>{rider.name}</div>
        </div>
        <div style={styles.detail}>
          <div style={styles.detailLabel}>Email:</div>
          <div style={styles.detailValue}>{rider.email}</div>
        </div>
        <div style={styles.detail}>
          <div style={styles.detailLabel}>Phone:</div>
          <div style={styles.detailValue}>{rider.phoneNumber || 'N/A'}</div>
        </div>
        <div style={styles.detail}>
          <div style={styles.detailLabel}>Address:</div>
          <div style={styles.detailValue}>{rider.address || 'N/A'}</div>
        </div>
        <div style={styles.detail}>
          <div style={styles.detailLabel}>Emergency Contact:</div>
          <div style={styles.detailValue}>{rider.emergencyContact || 'N/A'}</div>
        </div>
      </div>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Current Bus Assignments</h3>
        {assignedBuses.length > 0 ? (
          <div style={styles.busList}>
            {assignedBuses.map(bus => {
              const busAssignment = getBusAssignment(bus.id) || { 
                subscriptionType: 'none', 
                paymentStatus: 'unpaid',
                locationId: null
              };
              const locationName = getLocationName(bus, busAssignment.locationId);
              
              const canEdit = !isWithinOperatingHours(bus);
              if (canEdit) {
                console.log("Bus can be edited", bus.id);
              }
              
              return (
                <div key={bus.id} style={styles.busCard}>
                  <div style={styles.busInfo}>
                    <div style={styles.busName}>{bus.name}</div>
                    {bus.label && <div style={styles.busDetails}>{bus.label}</div>}
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      marginTop: spacing.xs
                    }}>
                      <span style={{
                        ...styles.badge,
                        ...(busAssignment.subscriptionType === 'monthly' ? styles.monthlyBadge : 
                           busAssignment.subscriptionType === 'per_ride' ? styles.perRideBadge : styles.noneBadge)
                      }}>
                        {busAssignment.subscriptionType === 'monthly' ? 'Monthly' : 
                         busAssignment.subscriptionType === 'per_ride' ? 'Per Ride' : 'None'}
                      </span>
                      
                      {busAssignment.subscriptionType !== 'none' && (
                        <span style={{
                          ...styles.badge,
                          ...(busAssignment.paymentStatus === 'paid' ? styles.paidBadge : 
                             busAssignment.paymentStatus === 'pending' ? styles.pendingBadge : styles.unpaidBadge)
                        }}>
                          {busAssignment.paymentStatus ? busAssignment.paymentStatus.charAt(0).toUpperCase() + busAssignment.paymentStatus.slice(1) : 'Unpaid'}
                        </span>
                      )}
                    </div>
                    
                    {busAssignment.locationId && (
                      <div style={{marginTop: spacing.xs, fontSize: '0.9rem'}}>
                        <strong>Location:</strong> {locationName || "Unable to find location details"}
                      </div>
                    )}
                    
                    <div style={styles.busCapacity}>
                      <span>Capacity: </span>
                      <div style={styles.capacityBar}>
                        <div 
                          style={{
                            ...styles.capacityFill,
                            width: `${(bus.currentRiders / bus.maxCapacity) * 100}%`,
                            backgroundColor: bus.currentRiders / bus.maxCapacity > 0.8 ? colors.status.error : colors.status.success
                          }}
                        />
                      </div>
                      <span>{bus.currentRiders}/{bus.maxCapacity}</span>
                    </div>
                    
                    <div style={{marginTop: spacing.xs, fontSize: '0.85rem'}}>
                      <strong>Operating:</strong> {bus.operatingTimeFrom} - {bus.operatingTimeTo}
                    </div>
                    
                    {bus.locations && bus.locations.length > 0 && (
                      <ul style={styles.locationsList}>
                        {bus.locations.slice(0, 2).map((location, index) => (
                          <li key={index} style={styles.locationItem}>
                            <div style={styles.locationDot}></div>
                            {location.name}
                          </li>
                        ))}
                        {bus.locations.length > 2 && (
                          <li style={styles.locationItem}>
                            <div style={styles.locationDot}></div>
                            +{bus.locations.length - 2} more locations...
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                  
                  <div style={{display: 'flex', flexDirection: 'column', gap: spacing.sm}}>
                    <button
                      style={{...styles.actionButton, ...styles.removeButton}}
                      onClick={() => handleRemoveBus(bus.id)}
                    >
                      Remove
                    </button>
                    
                    {busAssignment.subscriptionType !== 'none' && (
                      <div style={{display: 'flex', gap: spacing.xs}}>
                        <button
                          style={{
                            ...styles.actionButton, 
                            ...styles.payButton,
                            flex: 1,
                            fontSize: '0.8rem',
                            padding: `${spacing.xs} ${spacing.xs}`
                          }}
                          onClick={() => handleUpdatePayment(bus.id, 'paid')}
                          disabled={busAssignment.paymentStatus === 'paid'}
                        >
                          Paid
                        </button>
                        <button
                          style={{
                            ...styles.actionButton, 
                            backgroundColor: colors.status.warning,
                            color: colors.text.light,
                            flex: 1,
                            fontSize: '0.8rem',
                            padding: `${spacing.xs} ${spacing.xs}`
                          }}
                          onClick={() => handleUpdatePayment(bus.id, 'pending')}
                          disabled={busAssignment.paymentStatus === 'pending'}
                        >
                          Pending
                        </button>
                        <button
                          style={{
                            ...styles.actionButton, 
                            ...styles.removeButton,
                            flex: 1,
                            fontSize: '0.8rem',
                            padding: `${spacing.xs} ${spacing.xs}`
                          }}
                          onClick={() => handleUpdatePayment(bus.id, 'unpaid')}
                          disabled={busAssignment.paymentStatus === 'unpaid'}
                        >
                          Unpaid
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No buses assigned to this rider yet.</p>
        )}
      </div>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Manage Bus Assignments</h3>
        <div style={styles.busList}>
          {unassignedBuses.length > 0 ? (
            unassignedBuses.map(bus => (
              <div key={bus.id} style={styles.busCard}>
                <div style={styles.busInfo}>
                  <div style={styles.busName}>{bus.name}</div>
                  {bus.label && <div style={styles.busDetails}>{bus.label}</div>}
                  
                  <div style={styles.busCapacity}>
                    <span>Capacity: </span>
                    <div style={styles.capacityBar}>
                      <div 
                        style={{
                          ...styles.capacityFill,
                          width: `${(bus.currentRiders / bus.maxCapacity) * 100}%`,
                          backgroundColor: bus.currentRiders / bus.maxCapacity > 0.8 ? colors.status.error : colors.status.success
                        }}
                      />
                    </div>
                    <span>{bus.currentRiders}/{bus.maxCapacity}</span>
                  </div>
                  
                  <div style={{marginTop: spacing.xs, fontSize: '0.85rem'}}>
                    <strong>Operating:</strong> {bus.operatingTimeFrom} - {bus.operatingTimeTo}
                  </div>
                  
                  {bus.locations && bus.locations.length > 0 && (
                    <ul style={styles.locationsList}>
                      {bus.locations.slice(0, 2).map((location, index) => (
                        <li key={index} style={styles.locationItem}>
                          <div style={styles.locationDot}></div>
                          {location.name}
                        </li>
                      ))}
                      {bus.locations.length > 2 && (
                        <li style={styles.locationItem}>
                          <div style={styles.locationDot}></div>
                          +{bus.locations.length - 2} more locations...
                        </li>
                      )}
                    </ul>
                  )}
                </div>
                
                <button
                  style={{...styles.actionButton, ...styles.assignButton}}
                  onClick={() => {
                    setSelectedBus(bus);
                    setSubscriptionType('per_ride');
                    setSelectedLocationId(null);
                    setShowSubscriptionModal(true);
                  }}
                >
                  Subscribe
                </button>
              </div>
            ))
          ) : (
            <p>No available buses for assignment. Either all buses are full or the rider is already assigned to all buses.</p>
          )}
        </div>
      </div>
      
      {showSubscriptionModal && selectedBus && (
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
            width: '500px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{marginTop: 0}}>
              Subscribe to Bus
            </h3>
            <p>
              Choose details for {rider.name} on bus {selectedBus.name}:
            </p>
            
            <div style={{marginBottom: spacing.lg}}>
              <h4 style={{marginBottom: spacing.sm}}>Select Pickup/Dropoff Location:</h4>
              {selectedBus.locations && selectedBus.locations.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing.sm,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.sm,
                  padding: spacing.sm
                }}>
                  {selectedBus.locations.map((location, index) => (
                    <label key={location.id || index} style={{
                      display: 'block',
                      padding: spacing.sm,
                      border: `1px solid ${selectedLocationId === (location.id || `loc-${index}`) ? colors.primary.main : colors.border.light}`,
                      borderRadius: borderRadius.sm,
                      backgroundColor: selectedLocationId === (location.id || `loc-${index}`) ? colors.primary.light : 'transparent',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="locationId"
                        value={location.id || `loc-${index}`}
                        checked={selectedLocationId === (location.id || `loc-${index}`)}
                        onChange={() => {
                          console.log("Selected location:", location.name, "with ID:", location.id || `loc-${index}`);
                          setSelectedLocationId(location.id || `loc-${index}`);
                        }}
                        style={{marginRight: spacing.sm}}
                      />
                      <strong>{location.name}</strong>
                      <div style={{fontSize: '0.85rem', marginTop: spacing.xs}}>
                        Arrival time: {location.arrivalTimeFrom} - {location.arrivalTimeTo}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p>No locations defined for this bus.</p>
              )}
              {!selectedLocationId && <div style={styles.error}>Please select a location</div>}
            </div>
            
            <div style={{marginBottom: spacing.lg}}>
              <h4 style={{marginBottom: spacing.sm}}>Select Subscription Type:</h4>
              
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
                Daily (${parseFloat(selectedBus.pricePerRide || 0).toFixed(2)} per day)
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
                Monthly Subscription (${parseFloat(selectedBus.pricePerMonth || 0).toFixed(2)} per month)
              </label>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: spacing.md
            }}>
              <button
                style={{
                  padding: `${spacing.sm} ${spacing.lg}`,
                  backgroundColor: colors.text.secondary,
                  color: colors.text.light,
                  border: 'none',
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowSubscriptionModal(false);
                  setSelectedBus(null);
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: `${spacing.sm} ${spacing.lg}`,
                  backgroundColor: colors.primary.main,
                  color: colors.text.light,
                  border: 'none',
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer'
                }}
                onClick={handleAssignBus}
                disabled={!selectedLocationId}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDetails;