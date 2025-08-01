import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SessionManager = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let sessionCheckInterval;

    const checkSession = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // If no token or user data, don't do anything (user might not be logged in)
      if (!token || !storedUser) {
        return;
      }

      // Basic token expiration check for demo tokens
      if (token.startsWith('demo-jwt-token')) {
        // Demo tokens don't expire, just check if they exist
        return;
      }

      // For real JWT tokens, check expiration
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const tokenPayload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Date.now() / 1000;

          if (tokenPayload.exp && tokenPayload.exp < currentTime) {
            console.log('Token expired, logging out');
            logout();
            navigate('/');
            return;
          }
        }
      } catch (error) {
        console.log('Token parsing error (might be demo token):', error.message);
        // Don't logout for demo tokens
        if (!token.startsWith('demo-jwt-token')) {
          logout();
          navigate('/');
        }
      }
    };

    // Check session immediately
    checkSession();

    // Set up interval to check session every 10 minutes (less frequent)
    sessionCheckInterval = setInterval(checkSession, 10 * 60 * 1000);

    // Cleanup interval on unmount
    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, [user, logout, navigate]);

  // Handle browser tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Tab became visible, check if token still exists
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Token missing when tab became visible, logging out');
          logout();
          navigate('/');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, logout, navigate]);

  // Handle storage events (for multi-tab logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed in another tab
        logout();
        navigate('/');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout, navigate]);

  return children;
};

export default SessionManager;
