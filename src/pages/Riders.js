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
  removeRiderFromBus
} from '../services/riderService';
import { colors, typography, spacing, borderRadius } from '../themes/theme';

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
        setRiders(result.riders);
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
  
  const handleViewRiderDetails = (rider) => {
    setCurrentRider(rider);
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
      // Find the rider's bus assignments
      let busAssignments = rider.busAssignments || [];
      
      // If it's already an array of objects, update the specific bus assignment
      if (Array.isArray(busAssignments) && busAssignments.length > 0 && typeof busAssignments[0] === 'object') {
        busAssignments = busAssignments.map(assignment => {
          if (assignment.busId === busId) {
            return {
              ...assignment,
              paymentStatus: status
            };
          }
          return assignment;
        });
      } else if (Array.isArray(busAssignments)) {
        // Convert from simple array to array of objects
        busAssignments = busAssignments.map(id => ({
          busId: id,
          subscriptionType: 'none',
          paymentStatus: id === busId ? status : 'unpaid'
        }));
      } else {
        // Initialize as array of objects
        busAssignments = [{
          busId,
          subscriptionType: 'none',
          paymentStatus: status
        }];
      }
      
      // Update the rider in Firestore
      const result = await updateRider(riderId, {
        ...rider,
        busAssignments
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update the local state
      const updatedRider = { 
        ...rider, 
        busAssignments 
      };
      
      setRiders(riders.map(r => r.id === riderId ? updatedRider : r));
      setCurrentRider(updatedRider);
      
      toast.success(`Payment status updated to: ${status} for bus`);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error updating payment status:", error);
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
            onViewDetails={handleViewRiderDetails}
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

                 