import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const LogoutButton = ({ className = "logout-button" }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Try to call backend logout endpoint
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await API.post('/auth/logout');
        } catch (error) {
          console.log('Backend logout failed, proceeding with client-side logout');
        }
      }
      
      // Clear authentication data
      logout();
      
      // Navigate to login page
      navigate('/');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear local data
      logout();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className={className}
      disabled={isLoggingOut}
      title="Logout"
    >
      {isLoggingOut ? '🔄 Logging out...' : '🚪 Logout'}
    </button>
  );
};

export default LogoutButton;
