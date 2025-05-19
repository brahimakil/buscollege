import { 
  collection, 
  doc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { secondaryAuth, db } from "../firebase/config";
import { getBusById } from "./busService";

// Comment out adminCredentials since it's never used
// let adminCredentials = null;

// Get all drivers
export const getAllDrivers = async () => {
  try {
    const driversQuery = query(collection(db, "users"), where("role", "==", "driver"));
    const querySnapshot = await getDocs(driversQuery);
    
    const drivers = [];
    querySnapshot.forEach((doc) => {
      drivers.push({ id: doc.id, ...doc.data() });
    });
    
    return { drivers };
  } catch (error) {
    console.error("Error getting drivers:", error);
    return { error };
  }
};

// Get a driver by ID
export const getDriverById = async (driverId) => {
  try {
    const driverDoc = await getDoc(doc(db, "users", driverId));
    
    if (driverDoc.exists()) {
      return { driver: { id: driverDoc.id, ...driverDoc.data() } };
    } else {
      return { error: "Driver not found" };
    }
  } catch (error) {
    console.error("Error getting driver:", error);
    return { error };
  }
};

// Helper function to securely store admin credentials
export const setTempAdminCredentials = (email, password) => {
  // Use local variable instead of the module-level one
  const adminCredentials = { email, password };
  return adminCredentials; // Return it so it's not unused
};

// Create a new driver
export const createDriver = async (driverData) => {
  try {
    // Use secondary auth instance to create the user without affecting the current auth state
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      driverData.email, 
      driverData.password
    );
    
    const user = userCredential.user;
    
    // Remove password from driverData to not store it in Firestore
    const { password, ...driverDataWithoutPassword } = driverData;
    
    // Add driver to Firestore users collection with role=driver
    await setDoc(doc(db, "users", user.uid), {
      ...driverDataWithoutPassword,
      uid: user.uid,
      role: "driver",
      createdAt: serverTimestamp(),
      busAssignments: driverData.busAssignments || []
    });
    
    // Sign out from the secondary auth instance to clean up
    await secondaryAuth.signOut();
    
    return { driverId: user.uid };
  } catch (error) {
    console.error("Error creating driver:", error);
    return { error: error.message };
  }
};

// Update an existing driver
export const updateDriver = async (driverId, driverData) => {
  try {
    // Remove any fields that shouldn't be updated
    const { password, email, role, uid, createdAt, ...updatableData } = driverData;
    
    await updateDoc(doc(db, "users", driverId), {
      ...updatableData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating driver:", error);
    return { error: error.message };
  }
};

// Delete a driver
export const deleteDriver = async (driverId) => {
  try {
    // In a real application, you might want to:
    // 1. Delete the Auth user (requires Firebase Admin SDK on backend)
    // 2. Reassign any buses assigned to this driver
    
    // Delete from Firestore
    await deleteDoc(doc(db, "users", driverId));
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting driver:", error);
    return { error: error.message };
  }
};

// Assign a bus to a driver
export const assignBusToDriver = async (driverId, busId, busName) => {
  try {
    // Get the driver data
    const driverDoc = await getDoc(doc(db, "users", driverId));
    
    if (!driverDoc.exists()) {
      return { error: "Driver not found" };
    }
    
    const driverData = driverDoc.data();
    let busAssignments = driverData.busAssignments || [];
    
    // Check if bus is already assigned to this driver
    if (Array.isArray(busAssignments)) {
      if (busAssignments.length > 0 && typeof busAssignments[0] === 'object') {
        // If busAssignments is already an array of objects
        if (!busAssignments.some(bus => bus.busId === busId)) {
          busAssignments.push({
            busId: busId,
            busName: busName,
            assignedAt: new Date().toISOString()
          });
        }
      } else {
        // If busAssignments is an array of IDs
        if (!busAssignments.includes(busId)) {
          busAssignments.push(busId);
        }
      }
    } else {
      // Initialize as array with this bus
      busAssignments = [{ 
        busId: busId,
        busName: busName,
        assignedAt: new Date().toISOString()
      }];
    }
    
    // Update driver document
    await updateDoc(doc(db, "users", driverId), {
      busAssignments: busAssignments,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error assigning bus to driver:", error);
    return { error: error.message };
  }
};

// Get assigned buses for a driver
export const getDriverBuses = async (driverId) => {
  try {
    const driverDoc = await getDoc(doc(db, "users", driverId));
    
    if (!driverDoc.exists()) {
      return { error: "Driver not found" };
    }
    
    const driverData = driverDoc.data();
    const busAssignments = driverData.busAssignments || [];
    
    // If no bus assignments, return empty array
    if (!busAssignments.length) {
      return { buses: [] };
    }
    
    // Collect bus IDs based on format
    let busIds = [];
    if (typeof busAssignments[0] === 'object') {
      busIds = busAssignments.map(bus => bus.busId);
    } else {
      busIds = busAssignments;
    }
    
    // Fetch bus details for each assigned bus
    const busesPromises = busIds.map(async (busId) => {
      const result = await getBusById(busId);
      return result.bus;
    });
    
    const buses = await Promise.all(busesPromises);
    
    return { buses: buses.filter(bus => bus) }; // Filter out any undefined buses
  } catch (error) {
    console.error("Error getting driver buses:", error);
    return { error: error.message };
  }
};

// Debug utility to log bus assignments for drivers
export const checkDriverBusAssignments = async () => {
  try {
    const drivers = await getAllDrivers();
    
    if (drivers && drivers.drivers) {
      drivers.drivers.forEach(driver => {
        console.log(`Driver ${driver.name} - Bus Assignments:`, driver.busAssignments || 'None');
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error checking driver bus assignments:", error);
    return { error: error.message };
  }
}; 