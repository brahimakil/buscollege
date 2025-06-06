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
  Timestamp,
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
export const assignRiderToBus = async (riderId, riderName, riderEmail, busId, subscriptionType, locationId = null) => {
  try {
    const busRef = doc(db, "buses", busId);
    const busSnap = await getDoc(busRef);
    
    if (!busSnap.exists()) {
      return { error: "Bus not found" };
    }
    
    const busData = busSnap.data();
    const currentRiders = busData.currentRiders || [];
    
    // Check if rider is already assigned
    const isAlreadyAssigned = currentRiders.some(rider => 
      (typeof rider === 'string' && rider === riderId) || 
      (typeof rider === 'object' && rider.id === riderId)
    );
    
    if (isAlreadyAssigned) {
      return { error: "Rider is already assigned to this bus" };
    }
    
    // Add rider to bus currentRiders
    const newRiderEntry = {
      id: riderId,
      name: riderName,
      email: riderEmail,
      subscriptionType: subscriptionType,
      paymentStatus: 'unpaid',
      locationId: locationId
    };
    
    const updatedRiders = [...currentRiders, newRiderEntry];
    
    // Update bus document
    await updateDoc(busRef, {
      currentRiders: updatedRiders,
      updatedAt: Timestamp.now()
    });
    
    // Add to user collection busAssignments
    const userRef = doc(db, "users", riderId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const busAssignments = userData.busAssignments || [];
      
      // Create new bus assignment
      const newAssignment = {
        busId: busId,
        assignedAt: new Date().toISOString(),
        subscriptionType: subscriptionType,
        paymentStatus: 'unpaid',
        status: 'active',
        locationId: locationId,
        subscriberName: riderName,
        subscriberEmail: riderEmail,
        subscriptionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startDate: new Date().toISOString(),
        ...(subscriptionType === 'monthly' && {
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }),
        qrCode: JSON.stringify({
          userId: riderId,
          busId: busId,
          subscriptionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type: "bus_subscription"
        })
      };
      
      const updatedAssignments = [...busAssignments, newAssignment];
      
      await updateDoc(userRef, {
        busAssignments: updatedAssignments,
        updatedAt: serverTimestamp()
      });
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
    // Get the bus document
    const busRef = doc(db, "buses", busId);
    const busDoc = await getDoc(busRef);
    
    if (!busDoc.exists()) {
      return { error: "Bus not found" };
    }
    
    const busData = busDoc.data();
    const currentRiders = busData.currentRiders || [];
    
    // Find the rider in currentRiders
    let riderIndex = -1;
    
    // Look for the rider by ID
    riderIndex = currentRiders.findIndex(rider => {
      if (typeof rider === 'object' && rider !== null) {
        return rider.id === riderId;
      } else if (typeof rider === 'string') {
        return rider === riderId;
      }
      return false;
    });
    
    if (riderIndex === -1) {
      return { error: "Rider is not assigned to this bus" };
    }
    
    // Update the rider's subscription type
    const updatedRiders = [...currentRiders];
    const currentRider = updatedRiders[riderIndex];
    
    if (typeof currentRider === 'string') {
      // If it's just a string ID, we need to fetch rider data first
      try {
        const riderDoc = await getDoc(doc(db, "users", riderId));
        if (riderDoc.exists()) {
          const riderData = riderDoc.data();
          updatedRiders[riderIndex] = {
            id: riderId,
            name: riderData.fullName || riderData.name || 'Unknown User',
            email: riderData.email || 'No email',
            paymentStatus: 'unpaid', // Reset payment when changing subscription
            subscriptionType: subscriptionType
          };
        } else {
          updatedRiders[riderIndex] = {
            id: riderId,
            name: 'Unknown User',
            email: 'No email',
            paymentStatus: 'unpaid',
            subscriptionType: subscriptionType
          };
        }
      } catch (error) {
        console.error("Error fetching rider data:", error);
        updatedRiders[riderIndex] = {
          id: riderId,
          name: 'Unknown User',
          email: 'No email',
          paymentStatus: 'unpaid',
          subscriptionType: subscriptionType
        };
      }
    } else {
      // Update existing object
      updatedRiders[riderIndex] = {
        ...currentRider,
        subscriptionType: subscriptionType
      };
    }
    
    // Update the bus document
    await updateDoc(busRef, {
      currentRiders: updatedRiders,
      updatedAt: Timestamp.now()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating rider bus subscription:", error);
    return { error: error.message };
  }
};

// Update rider's payment status for a specific bus - sync both collections
export const updateRiderBusPaymentStatus = async (riderId, busId, paymentStatus) => {
  try {
    // Update bus collection first
    const busRef = doc(db, "buses", busId);
    const busSnap = await getDoc(busRef);
    
    if (!busSnap.exists()) {
      return { error: "Bus not found" };
    }
    
    const busData = busSnap.data();
    const currentRiders = busData.currentRiders || [];
    
    // Find rider index in bus collection
    const riderIndex = currentRiders.findIndex(r => 
      (typeof r === 'string' && r === riderId) || 
      (typeof r === 'object' && r.id === riderId)
    );
    
    if (riderIndex === -1) {
      return { error: "Rider not found on this bus" };
    }
    
    const currentRider = currentRiders[riderIndex];
    const updatedRiders = [...currentRiders];
    
    if (typeof currentRider === 'string') {
      try {
        const riderDoc = await getDoc(doc(db, "users", riderId));
        if (riderDoc.exists()) {
          const riderData = riderDoc.data();
          updatedRiders[riderIndex] = {
            id: riderId,
            name: riderData.fullName || riderData.name || 'Unknown User',
            email: riderData.email || 'No email',
            paymentStatus: paymentStatus,
            subscriptionType: 'per_ride'
          };
        }
      } catch (error) {
        console.error("Error fetching rider data:", error);
        updatedRiders[riderIndex] = {
          id: riderId,
          name: 'Unknown User',
          email: 'No email',
          paymentStatus: paymentStatus,
          subscriptionType: 'per_ride'
        };
      }
    } else {
      updatedRiders[riderIndex] = {
        ...currentRider,
        paymentStatus: paymentStatus
      };
    }
    
    // Update bus document
    await updateDoc(busRef, {
      currentRiders: updatedRiders,
      updatedAt: Timestamp.now()
    });
    
    // Update user collection - sync busAssignments
    const userRef = doc(db, "users", riderId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const busAssignments = userData.busAssignments || [];
      
      // Find and update the specific bus assignment
      const updatedAssignments = busAssignments.map(assignment => {
        if (assignment.busId === busId) {
          return {
            ...assignment,
            paymentStatus: paymentStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return assignment;
      });
      
      await updateDoc(userRef, {
        busAssignments: updatedAssignments,
        updatedAt: serverTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating rider payment status:", error);
    return { error: error.message };
  }
};

// Remove a rider from a bus - sync both collections
export const removeRiderFromBus = async (riderId, busId) => {
  try {
    // Remove from bus collection
    const busDoc = await getDoc(doc(db, "buses", busId));
    
    if (!busDoc.exists()) {
      return { error: "Bus not found" };
    }
    
    const busData = busDoc.data();
    const currentRiders = busData.currentRiders || [];
    
    // Remove rider from bus currentRiders
    const updatedRiders = currentRiders.filter(rider => 
      (typeof rider === 'object' ? rider.id : rider) !== riderId
    );
    
    // Update bus document
    await updateDoc(doc(db, "buses", busId), {
      currentRiders: updatedRiders,
      updatedAt: serverTimestamp()
    });
    
    // Remove from user collection busAssignments
    const riderDoc = await getDoc(doc(db, "users", riderId));
    
    if (riderDoc.exists()) {
      const riderData = riderDoc.data();
      let busAssignments = riderData.busAssignments || [];
      
      // Remove the specific bus assignment
      busAssignments = busAssignments.filter(assignment => assignment.busId !== busId);
      
      await updateDoc(doc(db, "users", riderId), {
        busAssignments: busAssignments,
        updatedAt: serverTimestamp()
      });
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