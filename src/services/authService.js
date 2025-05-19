import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// Register a new admin
export const registerAdmin = async (email, password, name) => {
  try {
    // Create the user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Add user data with admin role to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      name,
      role: "admin", // Set role as admin
      createdAt: new Date().toISOString()
    });
    
    return { user };
  } catch (error) {
    return { error };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore to check role
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      return { error: "User data not found" };
    }
    
    const userData = userDoc.data();
    
    // If accessing from web, ensure the user is an admin
    if (userData.role !== "admin") {
      await signOut(auth); // Sign out if not admin
      return { error: "Unauthorized access: Not an admin account" };
    }
    
    return { user: { ...userData, id: user.uid } };
  } catch (error) {
    return { error };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Get current authenticated user with role
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      if (user) {
        // Get user data with role from Firestore
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            resolve({ user: { ...userData, id: user.uid } });
          } else {
            resolve({ user: null });
          }
        } catch (error) {
          reject(error);
        }
      } else {
        resolve({ user: null });
      }
    });
  });
}; 