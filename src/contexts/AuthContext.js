import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { loginUser, logoutUser, registerAdmin } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user data with role from Firestore
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Only set authenticated user if they are an admin
            if (userData.role === "admin") {
              setCurrentUser({ ...userData, id: user.uid });
            } else {
              // Not an admin, sign them out
              await logoutUser();
              setCurrentUser(null);
              setError("Unauthorized access: Not an admin account");
            }
          } else {
            setCurrentUser(null);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError(err.message);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login function
  const login = async (email, password) => {
    setError(null);
    const result = await loginUser(email, password);
    if (result.error) {
      setError(result.error);
      return false;
    }
    setCurrentUser(result.user);
    return true;
  };

  // Register function (for admin accounts)
  const register = async (email, password, name) => {
    setError(null);
    const result = await registerAdmin(email, password, name);
    if (result.error) {
      setError(result.error);
      return false;
    }
    // Get user data after registration
    const docRef = doc(db, "users", result.user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setCurrentUser({ ...docSnap.data(), id: result.user.uid });
    }
    return true;
  };

  // Logout function
  const logout = async () => {
    setError(null);
    const result = await logoutUser();
    if (result.error) {
      setError(result.error);
      return false;
    }
    setCurrentUser(null);
    return true;
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    error,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 