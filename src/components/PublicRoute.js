import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If user is authenticated and is an admin, redirect to dashboard
  if (currentUser && currentUser.role === "admin") {
    return <Navigate to="/dashboard" />;
  }

  // Otherwise render the children (Login/Register components)
  return children;
};

export default PublicRoute; 