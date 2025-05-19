import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute; 