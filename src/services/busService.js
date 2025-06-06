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
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config";

// Completely rewritten getAllBuses function that preserves ALL database values
export const getAllBuses = async () => {
  try {
    const busesSnapshot = await getDocs(collection(db, "buses"));
    const buses = [];
    
    for (const busDoc of busesSnapshot.docs) {
      const busId = busDoc.id;
      const busData = busDoc.data();
      
      // ONLY USE currentRiders - IGNORE subscribers array
      const currentRiders = busData.currentRiders || [];
      
      // Process current riders to ensure they have complete data
      const processedRiders = [];
      
      for (const rider of currentRiders) {
        if (typeof rider === 'object' && rider !== null) {
          processedRiders.push({
            ...rider,
            paymentStatus: rider.paymentStatus || 'unpaid',
            subscriptionType: rider.subscriptionType || 'per_ride'
          });
        } else if (typeof rider === 'string') {
          // This is just a string ID - fetch rider data
          try {
            const riderDoc = await getDoc(doc(db, "users", rider));
            if (riderDoc.exists()) {
              const riderData = riderDoc.data();
              processedRiders.push({
                id: rider,
                name: riderData.fullName || riderData.name || 'Unknown User',
                email: riderData.email || 'No email',
                paymentStatus: 'unpaid', // Default for string-only riders
                subscriptionType: 'per_ride' // Default for string-only riders
              });
            } else {
              processedRiders.push({
                id: rider,
                name: 'Unknown User',
                email: 'No email available',
                paymentStatus: 'unpaid',
                subscriptionType: 'per_ride'
              });
            }
          } catch (error) {
            console.error(`Error fetching user data for rider ${rider}:`, error);
            processedRiders.push({
              id: rider,
              name: 'Unknown User',
              email: 'No email available',
              paymentStatus: 'unpaid',
              subscriptionType: 'per_ride'
            });
          }
        }
      }
      
      buses.push({ 
        id: busId, 
        ...busData,
        // ONLY INCLUDE currentRiders - IGNORE subscribers
        currentRiders: processedRiders
      });
    }
    
    return { buses };
  } catch (error) {
    console.error("Error getting buses:", error);
    return { error: error.message };
  }
};

// Get a bus by ID
export const getBusById = async (busId) => {
  try {
    const busDoc = await getDoc(doc(db, "buses", busId));
    
    if (busDoc.exists()) {
      return { bus: { id: busDoc.id, ...busDoc.data() } };
    } else {
      return { error: "Bus not found" };
    }
  } catch (error) {
    console.error("Error getting bus:", error);
    return { error };
  }
};

// Create a new bus
export const createBus = async (busData) => {
  try {
    // Format working days as an object for easier access
    const workingDays = {};
    if (busData.workingDays && Array.isArray(busData.workingDays)) {
      busData.workingDays.forEach(day => {
        workingDays[day] = true;
      });
    }

    // Format locations to ensure all required fields
    const formattedLocations = busData.locations?.map((location, index) => ({
      ...location,
      order: index, // Add explicit order field
      arrivalTimeFrom: location.arrivalTimeFrom || '',
      arrivalTimeTo: location.arrivalTimeTo || ''
    })) || [];

    // Create a new document in the buses collection
    const busRef = doc(collection(db, "buses"));
    await setDoc(busRef, {
      busName: busData.busName || '',
      busLabel: busData.busLabel || '',
      driverId: busData.driverId || null,
      driverName: busData.driverName || '',
      workingDays: workingDays,
      operatingTimeFrom: busData.operatingTimeFrom || '',
      operatingTimeTo: busData.operatingTimeTo || '',
      locations: formattedLocations,
      pricePerRide: busData.pricePerRide || 0,
      pricePerMonth: busData.pricePerMonth || 0,
      maxCapacity: busData.maxCapacity || 0,
      currentRiders: busData.currentRiders || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // If we have a driver assigned, update their busAssignments
    if (busData.driverId) {
      try {
        const driverDoc = await getDoc(doc(db, "users", busData.driverId));
        if (driverDoc.exists()) {
          const driverData = driverDoc.data();
          let busAssignments = driverData.busAssignments || [];
          
          // Check format and add bus to assignments if not already there
          if (Array.isArray(busAssignments)) {
            if (busAssignments.length > 0 && typeof busAssignments[0] === 'object') {
              if (!busAssignments.some(bus => bus.busId === busRef.id)) {
                busAssignments.push({
                  busId: busRef.id,
                  busName: busData.busName,
                  assignedAt: new Date().toISOString()
                });
              }
            } else {
              if (!busAssignments.includes(busRef.id)) {
                busAssignments.push(busRef.id);
              }
            }
            
            // Update driver document
            await updateDoc(doc(db, "users", busData.driverId), {
              busAssignments: busAssignments,
              updatedAt: serverTimestamp()
            });
          }
        }
      } catch (error) {
        console.error("Error updating driver's bus assignments:", error);
        // Don't return error, continue with bus creation
      }
    }
    
    return { busId: busRef.id };
  } catch (error) {
    console.error("Error creating bus:", error);
    return { error: error.message };
  }
};

// Update an existing bus
export const updateBus = async (busId, busData) => {
  try {
    // Format working days as an object if it's an array
    let workingDays = busData.workingDays;
    if (busData.workingDays && Array.isArray(busData.workingDays)) {
      workingDays = {};
      busData.workingDays.forEach(day => {
        workingDays[day] = true;
      });
    }

    // Format locations to ensure all required fields
    let formattedLocations = busData.locations;
    if (busData.locations && Array.isArray(busData.locations)) {
      formattedLocations = busData.locations.map((location, index) => ({
        ...location,
        order: index, // Add explicit order field
        arrivalTimeFrom: location.arrivalTimeFrom || '',
        arrivalTimeTo: location.arrivalTimeTo || ''
      }));
    }

    // Update bus document
    const updateData = {
      ...busData,
      workingDays: workingDays,
      locations: formattedLocations,
      updatedAt: serverTimestamp()
    };

    // Remove createdAt from update data if present
    delete updateData.createdAt;
    
    await updateDoc(doc(db, "buses", busId), updateData);
    
    // If we have a driver assigned, update their busAssignments
    if (busData.driverId) {
      const driverDoc = await getDoc(doc(db, "users", busData.driverId));
      if (driverDoc.exists()) {
        const driverData = driverDoc.data();
        let busAssignments = driverData.busAssignments || [];
        
        // Check format and add bus to assignments if not already there
        if (Array.isArray(busAssignments)) {
          if (busAssignments.length > 0 && typeof busAssignments[0] === 'object') {
            if (!busAssignments.some(bus => bus.busId === busId)) {
              busAssignments.push({
                busId: busId,
                busName: busData.busName,
                assignedAt: new Date().toISOString()
              });
            }
          } else {
            if (!busAssignments.includes(busId)) {
              busAssignments.push(busId);
            }
          }
          
          // Update driver document
          await updateDoc(doc(db, "users", busData.driverId), {
            busAssignments: busAssignments,
            updatedAt: serverTimestamp()
          });
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating bus:", error);
    return { error: error.message };
  }
};

// Delete a bus
export const deleteBus = async (busId) => {
  try {
    await deleteDoc(doc(db, "buses", busId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting bus:", error);
    return { error: error.message };
  }
};

// Get all drivers for dropdown selection
export const getAllDriversForSelection = async () => {
  try {
    const driversQuery = query(collection(db, "users"), where("role", "==", "driver"));
    const querySnapshot = await getDocs(driversQuery);
    
    const drivers = [];
    querySnapshot.forEach((doc) => {
      drivers.push({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email
      });
    });
    
    return { drivers };
  } catch (error) {
    console.error("Error getting drivers for selection:", error);
    return { error };
  }
};

// Get all riders for the bus assignment
export const getAllRidersForSelection = async () => {
  try {
    const ridersQuery = query(collection(db, "users"), where("role", "==", "rider"));
    const querySnapshot = await getDocs(ridersQuery);
    
    const riders = [];
    querySnapshot.forEach((doc) => {
      const riderData = doc.data();
      riders.push({
        id: doc.id,
        name: riderData.name,
        email: riderData.email,
        subscriptionType: riderData.subscriptionType || 'per_ride',
        paymentStatus: riderData.paymentStatus || 'unpaid'
      });
    });
    
    return { riders };
  } catch (error) {
    console.error("Error getting riders for selection:", error);
    return { error: error.message };
  }
};

// Add or remove riders from a bus
export const updateBusRiders = async (busId, riders) => {
  try {
    // Update bus document with riders
    await updateDoc(doc(db, "buses", busId), {
      currentRiders: riders,
      updatedAt: serverTimestamp()
    });

    // For each rider, update their busAssignments array in parallel
    if (riders && riders.length > 0) {
      const updatePromises = riders.map(async (rider) => {
        const riderDoc = await getDoc(doc(db, "users", rider.id));
        if (riderDoc.exists()) {
          const riderData = riderDoc.data();
          const busAssignments = riderData.busAssignments || [];
          
          if (!busAssignments.includes(busId)) {
            await updateDoc(doc(db, "users", rider.id), {
              busAssignments: [...busAssignments, busId],
              updatedAt: serverTimestamp()
            });
          }
        }
      });
      
      // Wait for all rider updates to complete
      await Promise.all(updatePromises);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating bus riders:", error);
    return { error: error.message };
  }
};

// Helper function to synchronize driver bus assignments
export const synchronizeDriverBusAssignments = async () => {
  try {
    // Get all buses
    const busesSnapshot = await getDocs(collection(db, "buses"));
    const buses = [];
    busesSnapshot.forEach((doc) => {
      buses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Create a mapping of driver IDs to their assigned buses
    const driverBusMap = {};
    buses.forEach(bus => {
      if (bus.driverId) {
        if (!driverBusMap[bus.driverId]) {
          driverBusMap[bus.driverId] = [];
        }
        
        driverBusMap[bus.driverId].push({
          busId: bus.id,
          busName: bus.busName,
          assignedAt: new Date().toISOString()
        });
      }
    });
    
    // Update each driver's busAssignments
    for (const [driverId, busList] of Object.entries(driverBusMap)) {
      await updateDoc(doc(db, "users", driverId), {
        busAssignments: busList,
        updatedAt: serverTimestamp()
      });
      console.log(`Updated busAssignments for driver ${driverId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error synchronizing driver bus assignments:", error);
    return { error: error.message };
  }
};

// Add a debug function to check what's actually in the database
export const debugBusRiders = async (busId) => {
  try {
    const busDoc = await getDoc(doc(db, "buses", busId));
    if (busDoc.exists()) {
      const busData = busDoc.data();
      console.log("Raw bus data from Firebase:", busData);
      console.log("Current riders in database:", busData.currentRiders);
      return { busData: busData };
    }
    return { error: "Bus not found" };
  } catch (error) {
    console.error("Error debugging bus:", error);
    return { error: error.message };
  }
}; 