import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    
    if (storedUser && storedRole) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({ ...userData, role: storedRole });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log('AuthContext: Logging in user', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userData.role);
    setLoading(false);
  };

  const isAdmin = user?.role === 'admin' || localStorage.getItem('role') === 'admin';

  const logout = () => {
    console.log('AuthContext: Logging out user');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    setLoading(false);
    // Redirect to login page
    window.location.href = '/';
  };

  // Verify token validity
  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // For demo tokens, always return true
    if (token.startsWith('demo-jwt-token')) {
      return true;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.log('Token verification failed (backend might be down):', error.message);
      // Don't logout if backend is down, just return false
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAdmin,
    isStudent: user?.role === 'student' || localStorage.getItem('role') === 'student',
    verifyToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
