import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, secondaryAuth } from "../firebase/config";

// Get all riders
export const getAllRiders = async () => {
  try {
    const ridersQuery = query(collection(db, "users"), where("role", "==", "rider"));
    const querySnapshot = await getDocs(ridersQuery);
    
    const riders = [];
    querySnapshot.forEach((doc) => {
      riders.push({ id: doc.id, ...doc.data() });
    });
    
    return { riders };
  } catch (error) {
    console.error("Error getting riders:", error);
    return { error };
  }
};

// Get a rider by ID
export const getRiderById = async (riderId) => {
  try {
    const riderDoc = await getDoc(doc(db, "users", riderId));
    
    if (riderDoc.exists()) {
      return { rider: { id: riderDoc.id, ...riderDoc.data() } };
    } else {
      return { error: "Rider not found" };
    }
  } catch (error) {
    console.error("Error getting rider:", error);
    return { error };
  }
};

// Create a new rider
export const createRider = async (riderData) => {
  try {
    // Use secondary auth instance to create the user without affecting the current auth state
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      riderData.email, 
      riderData.password
    );
    
    const user = userCredential.user;
    
    // Remove password from riderData to not store it in Firestore
    const { password, ...riderDataWithoutPassword } = riderData;
    
    // Add rider to Firestore users collection with role=rider
    await setDoc(doc(db, "users", user.uid), {
      ...riderDataWithoutPassword,
      uid: user.uid,
      role: "rider",
      createdAt: serverTimestamp(),
      busAssignments: []  // Initialize empty bus assignments
    });
    
    // Sign out from the secondary auth instance to clean up
    await secondaryAuth.signOut();
    
    return { riderId: user.uid };
  } catch (error) {
    console.error("Error creating rider:", error);
    return { error: error.message };
  }
};

// Update an existing rider
export const updateRider = async (riderId, riderData) => {
  try {
    // Remove password from update data if present (we don't update password this way)
    const { password, ...updateData } = riderData;
    
    // Set the updatedAt timestamp
    updateData.updatedAt = serverTimestamp();
    
    await updateDoc(doc(db, "users", riderId), updateData);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating rider:", error);
    return { error: error.message };
  }
};

// Delete a rider
export const deleteRider = async (riderId) => {
  try {
    // First, we need to check if the rider is assigned to any buses
    const busesQuery = query(collection(db, "buses"));
    const busesSnapshot = await getDocs(busesQuery);
    
    // Check each bus to see if the rider is assigned
    const assignedBuses = [];
    busesSnapshot.forEach((busDoc) => {
      const busData = busDoc.data();
      if (busData.currentRiders && busData.currentRiders.some(rider => rider.id === riderId)) {
        assignedBuses.push(busData.busName);
      }
    });
    
    // If rider is assigned to buses, return an error
    if (assignedBuses.length > 0) {
      return { 
        error: `Cannot delete rider as they are assigned to the following buses: ${assignedBuses.join(', ')}. Please remove from buses first.`
      };
    }
    
    // If not assigned to any bus, proceed with deletion
    await deleteDoc(doc(db, "users", riderId));
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting rider:", error);
    return { error: error.message };
  }
};

// Get all buses for assignment
export const getBusesForAssignment = async () => {
  try {
    const busesQuery = query(collection(db, "buses"));
    const querySnapshot = await getDocs(busesQuery);
    
    const buses = [];
    querySnapshot.forEach((doc) => {
      const busData = doc.data();
      const currentRiderCount = busData.currentRiders?.length || 0;
      const hasCapacity = currentRiderCount < busData.maxCapacity;
      
      buses.push({
        id: doc.id,
        name: busData.busName,
        label: busData.busLabel,
        currentRiders: currentRiderCount,
        maxCapacity: busData.maxCapacity,
        hasCapacity,
        locations: busData.locations || [],
        pricePerRide: parseFloat(busData.pricePerRide) || 0,
        pricePerMonth: parseFloat(busData.pricePerMonth) || 0
      });
    });
    
    return { buses };
  } catch (error) {
    console.error("Error getting buses for assignment:", error);
    return { error };
  }
};

// Update the assignRiderToBus function to simplify subscription types
export const assignRiderToBus = async (riderId, riderName, riderEmail, busId, subscriptionType = 'per_ride', locationId = null) => {
  try {
    // Get the bus data
    const busDoc = await getDoc(doc(db, "buses", busId));
    
    if (!busDoc.exists()) {
      return { error: "Bus not found" };
    }
    
    const busData = busDoc.data();
    const currentRiders = busData.currentRiders || [];
    
    // Check if rider is already assigned to this bus
    const existingRiderIndex = currentRiders.findIndex(rider => rider.id === riderId);
    
    // Create subscription dates
    const now = new Date();
    const startDate = now.toISOString();
    
    // Calculate end date based on subscription type
    let endDate = null;
    if (subscriptionType === 'per_ride') {
      // Daily subscription - expires after 24 hours
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      endDate = tomorrow.toISOString();
    } else if (subscriptionType === 'monthly') {
      // Monthly subscription - expires after 30 days
      const nextMonth = new Date(now);
      nextMonth.setDate(nextMonth.getDate() + 30);
      endDate = nextMonth.toISOString();
    }
    
    // Update bus document based on whether rider is already assigned
    if (existingRiderIndex >= 0) {
      // Update existing rider in the bus
      const updatedRiders = [...currentRiders];
      updatedRiders[existingRiderIndex] = {
        ...currentRiders[existingRiderIndex],
        subscriptionType: subscriptionType || 'per_ride',
        locationId: locationId,
        startDate: startDate,
        endDate: endDate
      };
      
      await updateDoc(doc(db, "buses", busId), {
        currentRiders: updatedRiders,
        updatedAt: serverTimestamp()
      });
    } else {
      // Check if bus has reached maximum capacity
      if (currentRiders.length >= busData.maxCapacity) {
        return { error: "Bus has reached maximum capacity" };
      }
      
      // Add rider to bus with subscription type, location, and dates
      const updatedRiders = [...currentRiders, {
        id: riderId,
        name: riderName,
        email: riderEmail,
        subscriptionType: subscriptionType || 'per_ride',
        paymentStatus: 'unpaid',
        locationId: locationId,
        startDate: startDate,
        endDate: endDate
      }];
      
      await updateDoc(doc(db, "buses", busId), {
        currentRiders: updatedRiders,
        updatedAt: serverTimestamp()
      });
    }
    
    // Add/update bus in rider's busAssignments
    const riderDoc = await getDoc(doc(db, "users", riderId));
    
    if (riderDoc.exists()) {
      const riderData = riderDoc.data();
      let busAssignments = riderData.busAssignments || [];
      
      // Convert busAssignments to array of objects format if it's not already
      if (Array.isArray(busAssignments) && busAssignments.length > 0 && typeof busAssignments[0] !== 'object') {
        busAssignments = busAssignments.map(id => ({
          busId: id,
          subscriptionType: 'per_ride',
          paymentStatus: 'unpaid'
        }));
      }
      
      // Create a timestamp separately to avoid serverTimestamp in array
      const now = new Date().toISOString();
      
      // Check if bus is already in assignments and update or add
      const existingAssignmentIndex = busAssignments.findIndex(
        assignment => typeof assignment === 'object' ? assignment.busId === busId : assignment === busId
      );
      
      if (existingAssignmentIndex >= 0) {
        // Update existing assignment
        const updatedAssignments = [...busAssignments];
        updatedAssignments[existingAssignmentIndex] = {
          ...busAssignments[existingAssignmentIndex],
          busId: busId,
          subscriptionType: subscriptionType || 'per_ride',
          locationId: locationId,
          startDate: startDate,
          endDate: endDate,
          updatedAt: now
        };
        
        await updateDoc(doc(db, "users", riderId), {
          busAssignments: updatedAssignments,
          updatedAt: serverTimestamp()
        });
      } else {
        // Add new assignment
        await updateDoc(doc(db, "users", riderId), {
          busAssignments: [...busAssignments, {
            busId: busId,
            subscriptionType: subscriptionType || 'per_ride',
            paymentStatus: 'unpaid',
            locationId: locationId,
            startDate: startDate,
            endDate: endDate,
            assignedAt: now
          }],
          updatedAt: serverTimestamp()
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error assigning rider to bus:", error);
    return { error: error.message };
  }
};

// Update rider's subscription type for a specific bus
export const updateRiderBusSubscription = async (riderId, busId, subscriptionType) => {
  try {
    // Get the bus data
    const busDoc = await getDoc(doc(db, "buses", busId));
    
    if (!busDoc.exists()) {
      return { error: "Bus not found" };
    }
    
    const busData = busDoc.data();
    const currentRiders = busData.currentRiders || [];
    
    // Find the rider in the bus
    const riderIndex = currentRiders.findIndex(rider => rider.id === riderId);
    
    if (riderIndex === -1) {
      return { error: "Rider is not assigned to this bus" };
    }
    
    // Create subscription dates
    const now = new Date();
    const startDate = now.toISOString();
    
    // Calculate end date based on subscription type
    let endDate = null;
    if (subscriptionType === 'per_ride') {
      // Daily subscription - expires after 24 hours
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      endDate = tomorrow.toISOString();
    } else if (subscriptionType === 'monthly') {
      // Monthly subscription - expires after 30 days
      const nextMonth = new Date(now);
      nextMonth.setDate(nextMonth.getDate() + 30);
      endDate = nextMonth.toISOString();
    }
    
    // Update rider's subscription type in the bus
    const updatedRiders = [...currentRiders];
    updatedRiders[riderIndex] = {
      ...updatedRiders[riderIndex],
      subscriptionType,
      startDate,
      endDate
    };
    
    // Update bus document
    await updateDoc(doc(db, "buses", busId), {
      currentRiders: updatedRiders,
      updatedAt: serverTimestamp()
    });
    
    // Update rider's busAssignments
    const riderDoc = await getDoc(doc(db, "users", riderId));
    
    if (riderDoc.exists()) {
      const riderData = riderDoc.data();
      const busAssignments = riderData.busAssignments || [];
      
      // Find the bus assignment
      const assignmentIndex = busAssignments.findIndex(
        assignment => typeof assignment === 'object' && assignment.busId === busId
      );
      
      if (assignmentIndex !== -1) {
        const updatedAssignments = [...busAssignments];
        
        // Use a standard timestamp string instead of serverTimestamp for array items
        const timestampString = new Date().toISOString();
        
        updatedAssignments[assignmentIndex] = {
          ...updatedAssignments[assignmentIndex],
          subscriptionType,
          startDate,
          endDate,
          updatedAt: timestampString // Use string timestamp instead of serverTimestamp()
        };
        
        await updateDoc(doc(db, "users", riderId), {
          busAssignments: updatedAssignments,
          updatedAt: serverTimestamp() // This is okay because it's not in an array
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating rider's subscription type:", error);
    return { error: error.message };
  }
};

// Update payment status for a rider on a specific bus
export const updateRiderBusPaymentStatus = async (riderId, busId, paymentStatus) => {
  try {
    const riderDoc = await getDoc(doc(db, "users", riderId));
    const busDoc = await getDoc(doc(db, "buses", busId));
    
    // First, update rider's bus assignment payment status
    if (riderDoc.exists()) {
      const riderData = riderDoc.data();
      let busAssignments = riderData.busAssignments || [];
      
      if (Array.isArray(busAssignments)) {
        // Convert to object format if necessary
        if (busAssignments.length > 0 && typeof busAssignments[0] !== 'object') {
          busAssignments = busAssignments.map(id => ({
            busId: id,
            subscriptionType: 'per_ride',
            paymentStatus: id === busId ? paymentStatus : 'unpaid'
          }));
        } else {
          // Update the payment status for the specific bus
          busAssignments = busAssignments.map(assignment => {
            if (assignment.busId === busId) {
              return {
                ...assignment,
                paymentStatus,
                updatedAt: new Date().toISOString()
              };
            }
            return assignment;
          });
        }
        
        // Update rider document with new payment status
        await updateDoc(doc(db, "users", riderId), {
          busAssignments,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    // Now update the bus's currentRiders with the new payment status
    if (busDoc.exists()) {
      const busData = busDoc.data();
      const currentRiders = busData.currentRiders || [];
      
      const riderIndex = currentRiders.findIndex(r => r.id === riderId);
      if (riderIndex !== -1) {
        // Update this rider's payment status
        const updatedRiders = [...currentRiders];
        updatedRiders[riderIndex] = {
          ...updatedRiders[riderIndex],
          paymentStatus
        };
        
        // Update the bus document
        await updateDoc(doc(db, "buses", busId), {
          currentRiders: updatedRiders,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating rider's payment status:", error);
    return { error: error.message };
  }
};

// Remove a rider from a bus
export const removeRiderFromBus = async (riderId, busId) => {
  try {
    // Get the bus data
    const busDoc = await getDoc(doc(db, "buses", busId));
    
    if (!busDoc.exists()) {
      return { error: "Bus not found" };
    }
    
    const busData = busDoc.data();
    const currentRiders = busData.currentRiders || [];
    
    // Remove rider from bus
    const updatedRiders = currentRiders.filter(rider => rider.id !== riderId);
    
    // Update bus document
    await updateDoc(doc(db, "buses", busId), {
      currentRiders: updatedRiders,
      updatedAt: serverTimestamp()
    });
    
    // Remove bus from rider's busAssignments
    const riderDoc = await getDoc(doc(db, "users", riderId));
    
    if (riderDoc.exists()) {
      const riderData = riderDoc.data();
      let busAssignments = riderData.busAssignments || [];
      
      // Handle different formats of busAssignments
      if (Array.isArray(busAssignments)) {
        if (busAssignments.length > 0 && typeof busAssignments[0] === 'object') {
          // If it's an array of objects (new format)
          busAssignments = busAssignments.filter(assignment => assignment.busId !== busId);
        } else {
          // If it's an array of IDs (old format)
          busAssignments = busAssignments.filter(id => id !== busId);
        }
        
        await updateDoc(doc(db, "users", riderId), {
          busAssignments: busAssignments,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error removing rider from bus:", error);
    return { error: error.message };
  }
};

// Create a new function to check and remove expired subscriptions
export const checkAndRemoveExpiredSubscriptions = async () => {
  try {
    const now = new Date().toISOString();
    
    // Get all buses
    const busesSnapshot = await getDocs(collection(db, "buses"));
    
    // Process each bus
    busesSnapshot.forEach(async (busDoc) => {
      const bus = { id: busDoc.id, ...busDoc.data() };
      const currentRiders = bus.currentRiders || [];
      
      // Find expired subscriptions
      const expiredRiderIds = [];
      const updatedRiders = currentRiders.filter(rider => {
        // Keep subscriptions that are per_ride (no expiration) or haven't expired yet
        if (rider.subscriptionType === 'per_ride' || !rider.endDate) {
          return true;
        }
        
        const hasExpired = rider.endDate <= now;
        if (hasExpired) {
          expiredRiderIds.push(rider.id);
        }
        return !hasExpired;
      });
      
      // Update bus if there are riders to remove
      if (currentRiders.length !== updatedRiders.length) {
        await updateDoc(doc(db, "buses", bus.id), {
          currentRiders: updatedRiders,
          updatedAt: serverTimestamp()
        });
      }
      
      // Update rider documents to remove expired bus assignments
      for (const riderId of expiredRiderIds) {
        const riderDoc = await getDoc(doc(db, "users", riderId));
        
        if (riderDoc.exists()) {
          const riderData = riderDoc.data();
          const busAssignments = riderData.busAssignments || [];
          
          if (Array.isArray(busAssignments) && busAssignments.length > 0) {
            const updatedAssignments = busAssignments.filter(assignment => {
              if (typeof assignment !== 'object') return true;
              if (assignment.busId !== bus.id) return true;
              
              // Keep if it's per_ride or hasn't expired
              if (assignment.subscriptionType === 'per_ride' || !assignment.endDate) {
                return true;
              }
              
              return assignment.endDate > now;
            });
            
            if (busAssignments.length !== updatedAssignments.length) {
              await updateDoc(doc(db, "users", riderId), {
                busAssignments: updatedAssignments,
                updatedAt: serverTimestamp()
              });
            }
          }
        }
      }
    });
    
    return { success: true, message: "Expired subscriptions removed" };
  } catch (error) {
    console.error("Error checking expired subscriptions:", error);
    return { error: error.message };
  }
}; 