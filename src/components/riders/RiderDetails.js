import React, { useState, useEffect, useCallback } from 'react';
import { getAllBuses } from '../../services/busService';
import { colors, spacing, typography, borderRadius } from '../../themes/theme';
import { toast } from 'react-toastify';

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

const RiderDetails = ({ rider, onUpdatePayment, onClose }) => {
  const [assignedBuses, setAssignedBuses] = useState([]);
  
  const fetchBuses = useCallback(async () => {
    try {
      const result = await getAllBuses();
      if (result.buses) {
        // Only get assigned buses for this rider
        const riderAssignedBuses = result.buses.filter(bus => {
          const currentRiders = bus.currentRiders || [];
          return currentRiders.some(r => 
            (typeof r === 'string' && r === rider.id) || 
            (typeof r === 'object' && r.id === rider.id)
          );
        }).map(bus => {
          // Get rider-specific data from the bus
          const currentRiders = bus.currentRiders || [];
          const riderData = currentRiders.find(r => 
            (typeof r === 'string' && r === rider.id) || 
            (typeof r === 'object' && r.id === rider.id)
          );
          
          return {
            ...bus,
            subscriptionType: typeof riderData === 'object' ? riderData.subscriptionType : 'per_ride',
            paymentStatus: typeof riderData === 'object' ? riderData.paymentStatus : 'unpaid',
            locationId: typeof riderData === 'object' ? riderData.locationId : null,
            assignedAt: typeof riderData === 'object' ? riderData.assignedAt : null,
            status: typeof riderData === 'object' ? riderData.status : 'active'
          };
        });
        
        setAssignedBuses(riderAssignedBuses);
      }
    } catch (error) {
      console.error("Error fetching buses:", error);
    }
  }, [rider.id]);
  
  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);
  
  const handleUpdatePayment = async (busId, status) => {
    if (onUpdatePayment) {
      try {
        await onUpdatePayment(rider.id, busId, status);
        
        setAssignedBuses(prevBuses => 
          prevBuses.map(bus => {
            if (bus.id === busId) {
              return {
                ...bus,
                paymentStatus: status
              };
            }
            return bus;
          })
        );
        
        toast.success(`Payment status updated to ${status}`);
        
      } catch (error) {
        console.error("Error updating payment status:", error);
        toast.error("Failed to update payment status");
      }
    }
  };
  
  if (!rider) return null;
  
  const getLocationName = (bus, locationId) => {
    if (!bus || !bus.locations || !locationId) return "Not selected";
    
    const location = bus.locations.find(loc => 
      (loc.id === locationId) || 
      (`loc-${loc.id}` === locationId) ||
      (typeof locationId === 'string' && loc.id === parseInt(locationId.replace('loc-', ''))) ||
      (index => `loc-${index}` === locationId)
    );
    
    return location ? location.name : "Location data unavailable";
  };
  
  // Helper function to get subscription status color
  const getSubscriptionStatusColor = (subscriptionType) => {
    switch (subscriptionType) {
      case 'monthly':
        return colors.primary.main;
      case 'per_ride':
        return colors.secondary.main;
      default:
        return colors.text.secondary;
    }
  };

  // Helper function to get payment status color
  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return colors.status.success;
      case 'pending':
        return colors.status.warning;
      case 'unpaid':
      default:
        return colors.status.error;
    }
  };

  // Helper function to check if subscription is cancelled/expired
  const isSubscriptionCancelled = (bus) => {
    if (bus.status === 'cancelled' || bus.status === 'inactive') {
      return true;
    }
    
    // Check if monthly subscription has expired
    if (bus.subscriptionType === 'monthly' && bus.endDate) {
      return new Date(bus.endDate) < new Date();
    }
    
    return false;
  };
  
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
          <div style={styles.detailValue}>
            {(() => {
              const name = rider.name || rider.fullName;
              if (typeof name === 'string' && name.trim()) {
                return name;
              } else if (typeof name === 'object' && name !== null) {
                return name.firstName && name.lastName 
                  ? `${name.firstName} ${name.lastName}`
                  : name.displayName || name.name || 'N/A';
              }
              return 'N/A';
            })()}
          </div>
        </div>
        <div style={styles.detail}>
          <div style={styles.detailLabel}>Email:</div>
          <div style={styles.detailValue}>
            {typeof rider.email === 'string' ? rider.email : 'N/A'}
          </div>
        </div>
        <div style={styles.detail}>
          <div style={styles.detailLabel}>Phone:</div>
          <div style={styles.detailValue}>
            {typeof rider.phoneNumber === 'string' ? rider.phoneNumber : 'N/A'}
          </div>
        </div>
        <div style={styles.detail}>
          <div style={styles.detailLabel}>Address:</div>
          <div style={styles.detailValue}>
            {typeof rider.address === 'string' ? rider.address : 'N/A'}
          </div>
        </div>
        <div style={styles.detail}>
          <div style={styles.detailLabel}>Emergency Contact:</div>
          <div style={styles.detailValue}>
            {typeof rider.emergencyContact === 'string' ? rider.emergencyContact : 'N/A'}
          </div>
        </div>
      </div>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Bus Subscriptions & Payment Status</h3>
        {assignedBuses.length > 0 ? (
          <div style={styles.busList}>
            {assignedBuses.map(bus => {
              const locationName = getLocationName(bus, bus.locationId);
              const isCancelled = isSubscriptionCancelled(bus);
              
              return (
                <div key={bus.id} style={{
                  ...styles.busCard,
                  ...(isCancelled ? { opacity: 0.6, backgroundColor: colors.background.default } : {})
                }}>
                  <div style={styles.busInfo}>
                    <div style={styles.busName}>
                      {typeof bus.name === 'string' ? bus.name : (bus.busName || 'Unknown Bus')}
                      {isCancelled && (
                        <span style={{
                          marginLeft: spacing.sm,
                          padding: `${spacing.xs} ${spacing.sm}`,
                          backgroundColor: colors.status.error,
                          color: colors.text.light,
                          borderRadius: borderRadius.sm,
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          CANCELLED
                        </span>
                      )}
                    </div>
                    
                    {bus.label && <div style={styles.busDetails}>{typeof bus.label === 'string' ? bus.label : ''}</div>}
                    
                    {/* Subscription Type Display */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      marginTop: spacing.sm
                    }}>
                      <div>
                        <strong>Subscription:</strong>
                        <span style={{
                          marginLeft: spacing.xs,
                          padding: `${spacing.xs} ${spacing.sm}`,
                          backgroundColor: getSubscriptionStatusColor(bus.subscriptionType),
                          color: colors.text.light,
                          borderRadius: borderRadius.sm,
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}>
                          {bus.subscriptionType === 'monthly' ? 'Monthly' : 
                           bus.subscriptionType === 'per_ride' ? 'Per Ride' : 'Unknown'}
                        </span>
                      </div>
                      
                      {/* Payment Status Display */}
                      <div>
                        <strong>Payment:</strong>
                        <span style={{
                          marginLeft: spacing.xs,
                          padding: `${spacing.xs} ${spacing.sm}`,
                          backgroundColor: getPaymentStatusColor(bus.paymentStatus),
                          color: colors.text.light,
                          borderRadius: borderRadius.sm,
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}>
                          {bus.paymentStatus ? bus.paymentStatus.toUpperCase() : 'UNPAID'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Location Display */}
                    {bus.locationId && (
                      <div style={{marginTop: spacing.sm, fontSize: '0.9rem'}}>
                        <strong>Pickup Location:</strong> {locationName || "Location not found"}
                      </div>
                    )}
                    
                    {/* Subscription Date */}
                    {bus.assignedAt && (
                      <div style={{marginTop: spacing.xs, fontSize: '0.85rem', color: colors.text.secondary}}>
                        <strong>Subscribed:</strong> {new Date(bus.assignedAt).toLocaleDateString()}
                      </div>
                    )}
                    
                    {/* Bus Capacity Display */}
                    <div style={styles.busCapacity}>
                      <span>Capacity: </span>
                      <div style={styles.capacityBar}>
                        <div 
                          style={{
                            ...styles.capacityFill,
                            width: `${((Array.isArray(bus.currentRiders) ? bus.currentRiders.length : (typeof bus.currentRiders === 'number' ? bus.currentRiders : 0)) / (bus.maxCapacity || 1)) * 100}%`,
                            backgroundColor: ((Array.isArray(bus.currentRiders) ? bus.currentRiders.length : (typeof bus.currentRiders === 'number' ? bus.currentRiders : 0)) / (bus.maxCapacity || 1)) > 0.8 ? colors.status.error : colors.status.success
                          }}
                        />
                      </div>
                      <span>
                        {Array.isArray(bus.currentRiders) ? bus.currentRiders.length : (typeof bus.currentRiders === 'number' ? bus.currentRiders : 0)}/
                        {bus.maxCapacity || 0}
                      </span>
                    </div>
                    
                    {/* Operating Hours */}
                    <div style={{marginTop: spacing.xs, fontSize: '0.85rem'}}>
                      <strong>Operating:</strong> {bus.operatingTimeFrom || 'N/A'} - {bus.operatingTimeTo || 'N/A'}
                    </div>
                  </div>
                  
                 
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: spacing.xl,
            backgroundColor: colors.background.default,
            borderRadius: borderRadius.md,
            color: colors.text.secondary
          }}>
            <div style={{fontSize: '3rem', marginBottom: spacing.md}}>🚌</div>
            <p>This rider is not subscribed to any buses.</p>
            <p style={{fontSize: '0.9rem', marginTop: spacing.sm}}>
              Riders can subscribe to buses through the mobile app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDetails;