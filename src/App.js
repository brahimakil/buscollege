import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Buses from './pages/Buses';
import Drivers from './pages/Drivers';
import Riders from './pages/Riders';
import './App.css';
import { scheduleSubscriptionCleanup } from './utils/scheduledTasks';

function App() {
  useEffect(() => {
    // Set up the subscription cleanup task
    const cleanupInterval = scheduleSubscriptionCleanup();
    
    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes - only accessible if not logged in */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* Protected admin routes - only accessible if logged in as admin */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/buses" 
            element={
              <PrivateRoute>
                <Buses />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/drivers" 
            element={
              <PrivateRoute>
                <Drivers />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/riders" 
            element={
              <PrivateRoute>
                <Riders />
              </PrivateRoute>
            } 
          />
          
          {/* Default route redirection */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" />} 
          />
          
          {/* Catch all other routes */}
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" />} 
          />
        </Routes>
        
        {/* Toast notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;
