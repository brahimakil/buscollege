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
  
  // Enhanced styles for Riders page
  const styles = {
    container: {
      padding: 0,
      minHeight: 'calc(100vh - 114px)',
    },
    header: {
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
      padding: `${spacing.xl} ${spacing.xl} ${spacing.lg} ${spacing.xl}`,
      marginBottom: spacing.xl,
      borderRadius: borderRadius.md,
      boxShadow: shadows.lg,
      position: 'relative',
      overflow: 'hidden',
    },
    headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: borderRadius.md,
    },
    headerContent: {
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'relative',
      zIndex: 2,
    },
    pageTitle: {
      fontSize: '2.5rem',
      fontWeight: typography.fontWeightBold,
      margin: 0,
      color: colors.text.light,
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
    },
    titleIcon: {
      fontSize: '2.5rem',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    },
    addButton: {
      backgroundColor: colors.accent.main,
      color: colors.text.light,
      border: 'none',
      padding: `${spacing.md} ${spacing.xl}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      fontWeight: typography.fontWeightBold,
      fontSize: typography.fontSize,
      boxShadow: shadows.md,
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
    },
    errorAlert: {
      backgroundColor: '#fef2f2',
      border: `1px solid #fecaca`,
      color: '#dc2626',
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      marginBottom: spacing.xl,
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
      boxShadow: shadows.sm,
    },
    loadingContainer: {
      textAlign: 'center',
      padding: `${spacing.xxl} ${spacing.xl}`,
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      boxShadow: shadows.sm,
    },
    loadingSpinner: {
      width: '48px',
      height: '48px',
      border: `4px solid ${colors.border.light}`,
      borderTop: `4px solid ${colors.primary.main}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto',
      marginBottom: spacing.lg,
    },
    loadingText: {
      fontSize: typography.h5.fontSize,
      color: colors.text.secondary,
      fontWeight: typography.fontWeightMedium,
    },
    contentArea: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      boxShadow: shadows.sm,
      overflow: 'hidden',
    },
    deleteModal: {
      textAlign: 'center',
      padding: spacing.lg,
    },
    deleteIcon: {
      fontSize: '4rem',
      color: colors.status.error,
      marginBottom: spacing.lg,
    },
    deleteMessage: {
      marginBottom: spacing.xl,
      color: colors.text.primary,
      fontSize: typography.fontSize,
      lineHeight: 1.6,
    },
    deleteActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: spacing.lg,
    },
    cancelButton: {
      padding: `${spacing.md} ${spacing.xl}`,
      backgroundColor: colors.border.main,
      color: colors.text.primary,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      fontWeight: typography.fontWeightMedium,
      transition: 'all 0.2s ease',
    },
    deleteButton: {
      padding: `${spacing.md} ${spacing.xl}`,
      backgroundColor: colors.status.error,
      color: colors.text.light,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      fontWeight: typography.fontWeightBold,
      transition: 'all 0.2s ease',
    },
  };
  
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
        
        // Refresh the riders list
        await fetchRiders();
        toast.success("Rider created successfully!");
      }
      
      // Close the modal
      setIsFormModalOpen(false);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error submitting rider:", error);
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
    const rider = riders.find(r => r.id === riderId);
    
    if (!rider) return;
    
    try {
      const result = await assignRiderToBus(
        riderId, 
        rider.name, 
        rider.email, 
        busId,
        subscriptionType,
        locationId
      );
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update the local state - handle both array and object formats for busAssignments
      let updatedBusAssignments;
      let isExistingAssignment = false;
      
      if (rider.busAssignments && Array.isArray(rider.busAssignments)) {
        // If it's already an array of objects, check if we need to update existing or add new
        if (rider.busAssignments.length > 0 && typeof rider.busAssignments[0] === 'object') {
          // Check if this bus is already assigned (we're editing)
          const existingAssignmentIndex = rider.busAssignments.findIndex(
            assignment => assignment.busId === busId
          );
          
          isExistingAssignment = existingAssignmentIndex >= 0;
          
          if (isExistingAssignment) {
            // Update existing assignment
            updatedBusAssignments = [...rider.busAssignments];
            updatedBusAssignments[existingAssignmentIndex] = {
              ...updatedBusAssignments[existingAssignmentIndex],
              busId,
              subscriptionType: subscriptionType || 'none',
              locationId
            };
          } else {
            // Add new assignment
            updatedBusAssignments = [
              ...rider.busAssignments, 
              {
                busId,
                subscriptionType: subscriptionType || 'none',
                paymentStatus: 'unpaid',
                locationId
              }
            ];
          }
        } else {
          // Convert from simple array to array of objects
          updatedBusAssignments = [
            ...rider.busAssignments.map(id => ({
              busId: id,
              subscriptionType: 'none',
              paymentStatus: 'unpaid'
            })),
            {
              busId,
              subscriptionType: subscriptionType || 'none',
              paymentStatus: 'unpaid',
              locationId
            }
          ];
        }
      } else {
        // Initialize as array of objects
        updatedBusAssignments = [{
          busId,
          subscriptionType: subscriptionType || 'none',
          paymentStatus: 'unpaid',
          locationId
        }];
      }
      
      const updatedRider = { 
        ...rider, 
        busAssignments: updatedBusAssignments
      };
      
      setRiders(riders.map(r => r.id === riderId ? updatedRider : r));
      setCurrentRider(updatedRider);
      
      toast.success(`Rider ${isExistingAssignment ? 'updated on' : 'assigned to'} bus with ${subscriptionType} subscription type.`);
      return true;
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error assigning rider to bus:", error);
      return false;
    }
  };
  
  const handleRemoveBus = async (riderId, busId) => {
    const rider = riders.find(r => r.id === riderId);
    
    if (!rider) return;
    
    try {
      const result = await removeRiderFromBus(riderId, busId);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update the local state with correct handling of both data formats
      let updatedBusAssignments;
      
      if (rider.busAssignments && Array.isArray(rider.busAssignments)) {
        // Check if busAssignments is an array of objects or just IDs
        if (rider.busAssignments.length > 0 && typeof rider.busAssignments[0] === 'object') {
          // Filter out the assignment with the matching busId
          updatedBusAssignments = rider.busAssignments.filter(
            assignment => assignment.busId !== busId
          );
        } else {
          // Handle the old format (array of IDs)
          updatedBusAssignments = rider.busAssignments.filter(id => id !== busId);
        }
      } else {
        // If busAssignments is not an array or doesn't exist
        updatedBusAssignments = [];
      }
      
      const updatedRider = { 
        ...rider, 
        busAssignments: updatedBusAssignments
      };
      
      setRiders(riders.map(r => r.id === riderId ? updatedRider : r));
      setCurrentRider(updatedRider);
      
      toast.success("Rider removed from bus successfully!");
      return true;
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error removing rider from bus:", error);
      return false;
    }
  };
  
  const handleUpdatePaymentForBus = async (riderId, busId, status) => {
    const rider = riders.find(r => r.id === riderId);
    
    if (!rider) return;
    
    try {
      // First, update the UI optimistically for better user experience
      const updatedRider = { 
        ...rider,
        busAssignments: rider.busAssignments?.map(assignment => {
          if (assignment.busId === busId) {
            return {
              ...assignment,
              paymentStatus: status
            };
          }
          return assignment;
        }) || []
      };
      
      // Update local state immediately
      setRiders(riders.map(r => r.id === riderId ? updatedRider : r));
      
      // Also update currentRider if it's the same rider
      if (currentRider && currentRider.id === riderId) {
        setCurrentRider(updatedRider);
      }
      
      // Then perform the actual database update using the dedicated service function
      // This will update both the rider document and the bus document
      const result = await updateRiderBusPaymentStatus(riderId, busId, status);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Confirm success to the user
      toast.success(`Payment status updated to: ${status} for bus`);
      
      // No need to refresh data - our optimistic update handled the UI
    } catch (error) {
      // On error, revert the optimistic UI update
      toast.error(`Error: ${error.message}`);
      console.error("Error updating payment status:", error);
      
      // Refresh data to revert to correct state
      fetchRiders();
    }
  };
  
  const handleUpdatePayment = async (riderId, busId, status) => {
    return handleUpdatePaymentForBus(riderId, busId, status);
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: typography.h3.fontSize, 
            margin: 0, 
            color: colors.text.primary 
          }}>
            Rider Management
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
            onViewDetails={handleViewDetails}
          />
        )}
        
        {/* Create/Edit Rider Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={currentRider ? 'Edit Rider' : 'Add New Rider'}
        >
          <RiderForm 
            rider={currentRider} 
            onSubmit={handleRiderSubmit}
            onCancel={() => setIsFormModalOpen(false)}
          />
        </Modal>
        
        {/* Rider Details Modal */}
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Rider Details"
          large={true}
        >
          {currentRider && (
            <RiderDetails 
              rider={currentRider}
              onAssignBus={handleAssignBus}
              onRemoveBus={handleRemoveBus}
              onUpdatePayment={handleUpdatePayment}
              onClose={() => setIsDetailsModalOpen(false)}
            />
          )}
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete"
        >
          <p style={{ marginBottom: spacing.lg, color: colors.text.primary }}>
            Are you sure you want to delete the rider <strong>{riderToDelete?.name}</strong>?
            This action cannot be undone.
          </p>
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
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Riders;

                 