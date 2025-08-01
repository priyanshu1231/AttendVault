// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  // Show loading while auth context is initializing
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        🔄 Loading...
      </div>
    );
  }

  // Check authentication
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || '{}');
  const isAuthenticated = token && (user || storedUser.email);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Get user role for admin check
  const userRole = user?.role || storedUser?.role || localStorage.getItem('role');

  // Check admin-only routes
  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
