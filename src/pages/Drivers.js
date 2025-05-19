import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import DriversList from '../components/drivers/DriversList';
import DriverForm from '../components/drivers/DriverForm';
import Modal from '../components/ui/Modal';
import { 
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  checkDriverBusAssignments
} from '../services/driverService';
import { colors, typography, spacing, borderRadius } from '../themes/theme';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);
  
  // Fetch drivers on component mount
  useEffect(() => {
    const checkAssignments = async () => {
      await checkDriverBusAssignments();
    };
    
    fetchDrivers();
    checkAssignments(); // Debug call to check assignments
  }, []);
  
  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllDrivers();
      
      if (result.error) {
        setError(result.error);
      } else {
        setDrivers(result.drivers);
      }
    } catch (err) {
      setError('Failed to fetch drivers. Please try again later.');
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddDriver = () => {
    setCurrentDriver(null); // Reset current driver for add form
    setIsFormModalOpen(true);
  };
  
  const handleEditDriver = (driver) => {
    setCurrentDriver(driver);
    setIsFormModalOpen(true);
  };
  
  const handleDeleteClick = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    setDriverToDelete(driver);
    setIsDeleteModalOpen(true);
  };
  
  const handleDriverSubmit = async (formData) => {
    try {
      if (currentDriver) {
        // Update existing driver
        const result = await updateDriver(currentDriver.id, formData);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Update local state
        setDrivers(drivers.map(driver => 
          driver.id === currentDriver.id ? { ...driver, ...formData } : driver
        ));
        
        toast.success("Driver updated successfully!");
      } else {
        // Create new driver
        const result = await createDriver(formData);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Refresh the drivers list
        await fetchDrivers();
        toast.success("Driver created successfully!");
      }
      
      // Close the modal
      setIsFormModalOpen(false);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error submitting driver:", error);
    }
  };
  
  const confirmDeleteDriver = async () => {
    if (!driverToDelete) return;
    
    try {
      const result = await deleteDriver(driverToDelete.id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update local state
      setDrivers(drivers.filter(driver => driver.id !== driverToDelete.id));
      toast.success("Driver deleted successfully!");
      
      // Close the modal
      setIsDeleteModalOpen(false);
      setDriverToDelete(null);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error deleting driver:", error);
    }
  };
  
  return (
    <MainLayout>
      <div style={{ padding: "20px" }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px',
          width: '100%',
          backgroundColor: colors.background.paper,
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '24px', margin: 0 }}>Driver Management</h2>
          
          <button 
            style={{ 
              backgroundColor: colors.primary.main,
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={handleAddDriver}
          >
            Add New Driver
          </button>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            fontSize: '16px',
            color: '#666'
          }}>
            Loading drivers...
          </div>
        ) : (
          <DriversList 
            drivers={drivers} 
            onEdit={handleEditDriver} 
            onDelete={handleDeleteClick} 
          />
        )}
        
        {/* Create/Edit Driver Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={currentDriver ? 'Edit Driver' : 'Add New Driver'}
        >
          <DriverForm 
            driver={currentDriver} 
            onSubmit={handleDriverSubmit}
            onCancel={() => setIsFormModalOpen(false)}
          />
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete"
        >
          <p style={{ marginBottom: '20px' }}>
            Are you sure you want to delete the driver <strong>{driverToDelete?.name}</strong>?
            This action cannot be undone.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}>
            <button 
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={confirmDeleteDriver}
            >
              Delete
            </button>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Drivers; 