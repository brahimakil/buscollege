import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import RidersList from '../components/riders/RidersList';
import RiderForm from '../components/riders/RiderForm';
import RiderDetails from '../components/riders/RiderDetails';
import Modal from '../components/ui/Modal';
import { 
  getAllRiders,
  createRider,
  updateRider,
  deleteRider,
  assignRiderToBus,
  removeRiderFromBus,
  updateRiderBusPaymentStatus
} from '../services/riderService';
import { colors, typography, spacing, borderRadius, shadows } from '../themes/theme';

const Riders = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentRider, setCurrentRider] = useState(null);
  const [riderToDelete, setRiderToDelete] = useState(null);
  
  // Fetch riders on component mount
  useEffect(() => {
    fetchRiders();
  }, []);
  
  const fetchRiders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllRiders();
      
      if (result.error) {
        setError(result.error);
      } else {
        setRiders(result.riders || []);
      }
    } catch (err) {
      setError('Failed to fetch riders. Please try again later.');
      console.error('Error fetching riders:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddRider = () => {
    setCurrentRider(null); // Reset current rider for add form
    setIsFormModalOpen(true);
  };
  
  const handleEditRider = (rider) => {
    setCurrentRider(rider);
    setIsFormModalOpen(true);
  };
  
  const handleViewDetails = (rider) => {
    // Always fetch the latest rider data before showing details
    const latestRider = riders.find(r => r.id === rider.id) || rider;
    setCurrentRider(latestRider);
    setIsDetailsModalOpen(true);
  };
  
  const handleDeleteClick = (riderId) => {
    const rider = riders.find(r => r.id === riderId);
    setRiderToDelete(rider);
    setIsDeleteModalOpen(true);
  };
  
  const handleRiderSubmit = async (formData) => {
    try {
      if (currentRider) {
        // Update existing rider
        const result = await updateRider(currentRider.id, formData);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Update local state
        setRiders(riders.map(rider => 
          rider.id === currentRider.id ? { ...rider, ...formData } : rider
        ));
        
        toast.success("Rider updated successfully!");
      } else {
        // Create new rider
        const result = await createRider(formData);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Refresh riders list
        fetchRiders();
        
        toast.success("Rider created successfully!");
      }
      
      // Close the modal
      setIsFormModalOpen(false);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error submitting rider form:", error);
    }
  };
  
  const handleDeleteRider = async () => {
    if (!riderToDelete) return;
    
    try {
      const result = await deleteRider(riderToDelete.id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update local state
      setRiders(riders.filter(rider => rider.id !== riderToDelete.id));
      toast.success("Rider deleted successfully!");
      
      // Close the modal
      setIsDeleteModalOpen(false);
      setRiderToDelete(null);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error deleting rider:", error);
    }
  };
  
  const handleAssignBus = async (riderId, busId, subscriptionType = 'none', locationId = null) => {
    try {
      const rider = riders.find(r => r.id === riderId);
      if (!rider) {
        throw new Error('Rider not found');
      }
      
      const result = await assignRiderToBus(
        riderId, 
        rider.fullName, 
        rider.email, 
        busId, 
        subscriptionType, 
        locationId
      );
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Refresh the riders list to get updated data
      fetchRiders();
      
      toast.success("Bus assigned successfully!");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error assigning bus:", error);
    }
  };
  
  const handleRemoveBus = async (riderId, busId) => {
    try {
      const result = await removeRiderFromBus(riderId, busId);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Refresh the riders list to get updated data
      fetchRiders();
      
      toast.success("Bus removed successfully!");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error removing bus:", error);
    }
  };
  
  const handleUpdatePaymentForBus = async (riderId, busId, status) => {
    try {
      const result = await updateRiderBusPaymentStatus(riderId, busId, status);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update local state
      setRiders(riders.map(rider => {
        if (rider.id === riderId) {
          const updatedAssignedBuses = (rider.assignedBuses || []).map(bus => {
            if (bus.busId === busId) {
              return { ...bus, paymentStatus: status };
            }
            return bus;
          });
          
          return { ...rider, assignedBuses: updatedAssignedBuses };
        }
        return rider;
      }));
      
      toast.success("Payment status updated successfully!");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error updating payment status:", error);
    }
  };
  
  const handleUpdatePayment = async (riderId, busId, status) => {
    try {
      const result = await updateRiderBusPaymentStatus(riderId, busId, status);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update local state
      setRiders(riders.map(rider => {
        if (rider.id === riderId) {
          const updatedAssignedBuses = (rider.assignedBuses || []).map(bus => {
            if (bus.busId === busId) {
              return { ...bus, paymentStatus: status };
            }
            return bus;
          });
          
          return { ...rider, assignedBuses: updatedAssignedBuses };
        }
        return rider;
      }));
      
      // If currentRider is being displayed in details modal, update it too
      if (currentRider && currentRider.id === riderId) {
        const updatedCurrentRider = riders.find(r => r.id === riderId);
        if (updatedCurrentRider) {
          setCurrentRider({
            ...updatedCurrentRider,
            assignedBuses: (updatedCurrentRider.assignedBuses || []).map(bus => {
              if (bus.busId === busId) {
                return { ...bus, paymentStatus: status };
              }
              return bus;
            })
          });
        }
      }
      
      toast.success("Payment status updated successfully!");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error updating payment status:", error);
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: spacing.lg }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: spacing.xl,
          backgroundColor: colors.background.paper,
          padding: spacing.lg,
          borderRadius: borderRadius.md,
          boxShadow: shadows.sm
        }}>
          <h2 style={{ 
            fontSize: typography.h3.fontSize, 
            margin: 0, 
            color: colors.text.primary 
          }}>
            👥 Rider Management
          </h2>
          
          <button 
            style={{ 
              backgroundColor: colors.primary.main,
              color: colors.text.light,
              border: 'none',
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: borderRadius.sm,
              cursor: 'pointer',
              fontWeight: typography.fontWeightMedium
            }}
            onClick={handleAddRider}
          >
            Add New Rider
          </button>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: colors.status.errorLight,
            color: colors.status.error,
            padding: spacing.md,
            borderRadius: borderRadius.sm,
            marginBottom: spacing.lg
          }}>
            {error}
          </div>
        )}
        
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: spacing.xxl,
            fontSize: typography.fontSize,
            color: colors.text.secondary
          }}>
            Loading riders...
          </div>
        ) : (
          <RidersList 
            riders={riders} 
            onEdit={handleEditRider} 
            onDelete={handleDeleteClick} 
            onAssignBus={handleAssignBus}
            onViewDetails={handleViewDetails}
          />
        )}
        
        {/* Modals */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={currentRider ? "Edit Rider" : "Add New Rider"}
          size="lg"
        >
          <RiderForm
            rider={currentRider}
            onSubmit={handleRiderSubmit}
            onCancel={() => setIsFormModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete"
          size="sm"
        >
          <div style={{ textAlign: 'center', padding: spacing.lg }}>
            <div style={{ fontSize: '3rem', marginBottom: spacing.md }}>🗑️</div>
            <p style={{ marginBottom: spacing.lg, color: colors.text.primary }}>
              Are you sure you want to delete{' '}
              <strong>{riderToDelete?.fullName}</strong>?
              <br />
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: spacing.md }}>
              <button 
                style={{
                  padding: `${spacing.sm} ${spacing.lg}`,
                  backgroundColor: colors.border.main,
                  color: colors.text.primary,
                  border: 'none',
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer'
                }}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                style={{
                  padding: `${spacing.sm} ${spacing.lg}`,
                  backgroundColor: colors.status.error,
                  color: colors.text.light,
                  border: 'none',
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer'
                }}
                onClick={handleDeleteRider}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Rider Details"
          size="xl"
        >
          {currentRider && (
            <RiderDetails 
              rider={currentRider}
              onUpdatePayment={handleUpdatePayment}
              onRemoveBus={handleRemoveBus}
              onAssignBus={handleAssignBus}
              onClose={() => setIsDetailsModalOpen(false)}
            />
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Riders;

                 