import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import BusList from '../components/buses/BusList';
import BusForm from '../components/buses/BusForm';
import BusDetails from '../components/buses/BusDetails';
import Modal from '../components/ui/Modal';
import { 
  getAllBuses,
  createBus,
  updateBus,
  deleteBus,
  getAllRidersForSelection,
  updateBusRiders
} from '../services/busService';
import { assignRiderToBus, updateRiderBusPaymentStatus, updateRiderBusSubscription } from '../services/riderService';
import { colors, typography, spacing, borderRadius } from '../themes/theme';

const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentBus, setCurrentBus] = useState(null);
  const [busToDelete, setBusToDelete] = useState(null);
  
  // Fetch buses on component mount
  useEffect(() => {
    fetchBuses();
    fetchRiders();
  }, []);
  
  const fetchBuses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllBuses();
      
      if (result.error) {
        setError(result.error);
      } else {
        setBuses(result.buses);
      }
    } catch (err) {
      setError('Failed to fetch buses. Please try again later.');
      console.error('Error fetching buses:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRiders = async () => {
    try {
      const result = await getAllRidersForSelection();
      if (result.riders) {
        setRiders(result.riders);
      }
    } catch (err) {
      console.error('Error fetching riders:', err);
    }
  };
  
  const handleAddBus = () => {
    setCurrentBus(null); // Reset current bus for add form
    setIsFormModalOpen(true);
  };
  
  const handleEditBus = (bus) => {
    setCurrentBus(bus);
    setIsFormModalOpen(true);
  };
  
  const handleViewBusDetails = (bus) => {
    setCurrentBus(bus);
    setIsDetailsModalOpen(true);
  };
  
  const handleDeleteClick = (busId) => {
    const bus = buses.find(b => b.id === busId);
    setBusToDelete(bus);
    setIsDeleteModalOpen(true);
  };
  
  const handleBusSubmit = async (formData) => {
    try {
      if (currentBus) {
        // Update existing bus
        const result = await updateBus(currentBus.id, formData);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Update local state with proper handling of complex fields
        setBuses(buses.map(bus => {
          if (bus.id === currentBus.id) {
            // Ensure we keep the ID and merge correctly
            return { 
              ...bus, 
              ...formData,
              id: bus.id 
            };
          }
          return bus;
        }));
        
        toast.success("Bus updated successfully!");
      } else {
        // Create new bus
        const result = await createBus(formData);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Fetch all buses to ensure we have the latest data
        fetchBuses();
        
        toast.success("Bus created successfully!");
      }
      
      // Close the modal
      setIsFormModalOpen(false);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error submitting bus form:", error);
    }
  };
  
  const handleDeleteBus = async () => {
    if (!busToDelete) return;
    
    try {
      const result = await deleteBus(busToDelete.id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update local state
      setBuses(buses.filter(bus => bus.id !== busToDelete.id));
      toast.success("Bus deleted successfully!");
      
      // Close the modal
      setIsDeleteModalOpen(false);
      setBusToDelete(null);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error deleting bus:", error);
    }
  };
  
  const handleAssignRider = async (rider, subscriptionType) => {
    if (!currentBus) return;
    
    const updatedBus = { ...currentBus };
    const currentRiders = updatedBus.currentRiders || [];
    
    // Check if we've reached max capacity
    if (currentRiders.length >= updatedBus.maxCapacity) {
      toast.error("Cannot add more riders. Bus is at maximum capacity.");
      return;
    }
    
    try {
      const result = await assignRiderToBus(
        rider.id,
        rider.name,
        rider.email,
        currentBus.id,
        subscriptionType
      );
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Add the rider with subscription type
      const newRider = {
        id: rider.id,
        name: rider.name,
        email: rider.email,
        subscriptionType,
        paymentStatus: 'unpaid'
      };
      
      // Update local state
      updatedBus.currentRiders = [...currentRiders, newRider];
      setBuses(buses.map(bus => bus.id === currentBus.id ? updatedBus : bus));
      setCurrentBus(updatedBus);
      
      toast.success(`${rider.name} has been assigned to this bus with ${subscriptionType === 'monthly' ? 'monthly subscription' : 'per ride payment'}.`);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error assigning rider:", error);
    }
  };
  
  const handleRemoveRider = async (riderId) => {
    if (!currentBus) return;
    
    const updatedBus = { ...currentBus };
    const currentRiders = updatedBus.currentRiders || [];
    
    // Remove the rider
    const updatedRiders = currentRiders.filter(rider => rider.id !== riderId);
    
    try {
      await updateBusRiders(currentBus.id, updatedRiders);
      
      // Update local state
      updatedBus.currentRiders = updatedRiders;
      setBuses(buses.map(bus => bus.id === currentBus.id ? updatedBus : bus));
      setCurrentBus(updatedBus);
      
      toast.success(`Rider has been removed from this bus.`);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error removing rider:", error);
    }
  };
  
  const handleUpdateRider = async (riderId, updates) => {
    if (!currentBus) return;
    
    try {
      const updatedBus = { ...currentBus };
      const currentRiders = updatedBus.currentRiders || [];
      
      // Find the rider to update
      const riderIndex = currentRiders.findIndex(rider => rider.id === riderId);
      
      if (riderIndex === -1) {
        toast.error("Rider not found in this bus.");
        return;
      }
      
      // Update in Firestore based on what's changing
      if (updates.paymentStatus && currentRiders[riderIndex].paymentStatus !== updates.paymentStatus) {
        const result = await updateRiderBusPaymentStatus(riderId, currentBus.id, updates.paymentStatus);
        if (result.error) {
          throw new Error(result.error);
        }
      }
      
      if (updates.subscriptionType && currentRiders[riderIndex].subscriptionType !== updates.subscriptionType) {
        const result = await updateRiderBusSubscription(riderId, currentBus.id, updates.subscriptionType);
        if (result.error) {
          throw new Error(result.error);
        }
      }
      
      // Update the local state immediately without waiting for a refresh
      const updatedRiders = [...currentRiders];
      updatedRiders[riderIndex] = {
        ...updatedRiders[riderIndex],
        ...updates
      };
      
      updatedBus.currentRiders = updatedRiders;
      
      // Update both the buses array and the currentBus
      setBuses(buses.map(bus => bus.id === currentBus.id ? updatedBus : bus));
      setCurrentBus(updatedBus);
      
      // Fetch fresh data to ensure everything is in sync
      setTimeout(() => fetchBuses(), 500);
      
      toast.success("Rider information updated successfully.");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error updating rider:", error);
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: typography.h3.fontSize, 
            margin: 0, 
            color: colors.text.primary 
          }}>
            Bus Management
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
            onClick={handleAddBus}
          >
            Add New Bus
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
            Loading buses...
          </div>
        ) : (
          <BusList 
            buses={buses} 
            onEdit={handleEditBus} 
            onDelete={handleDeleteClick} 
            onViewDetails={handleViewBusDetails}
          />
        )}
        
        {/* Create/Edit Bus Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={currentBus ? 'Edit Bus' : 'Add New Bus'}
        >
          <BusForm 
            bus={currentBus} 
            onSubmit={handleBusSubmit}
            onCancel={() => setIsFormModalOpen(false)}
          />
        </Modal>
        
        {/* Bus Details Modal */}
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Bus Details"
          large={true}
        >
          {currentBus && (
            <BusDetails 
              bus={currentBus}
              riders={riders}
              onAssignRider={handleAssignRider}
              onRemoveRider={handleRemoveRider}
              onUpdateRider={handleUpdateRider}
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
            Are you sure you want to delete the bus <strong>{busToDelete?.busName}</strong>?
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
              onClick={handleDeleteBus}
            >
              Delete
            </button>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Buses;