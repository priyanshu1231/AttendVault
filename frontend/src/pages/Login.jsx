import React, { useState, useEffect } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Input validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      // Try backend authentication first
      let response;
      try {
        response = await API.post('/auth/login', formData);

        if (response.data.success) {
          const { token, user } = response.data.data;

          // Store authentication data
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('role', user.role);

          // Update AuthContext
          login(user);

          // Navigate based on role
          if (user.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/dashboard');
          }
          return;
        }
      } catch (backendError) {
        console.log('Backend not available, using demo credentials');

        // Fallback to demo credentials for testing
        const demoCredentials = {
          'admin@gmail.com': {
            password: 'admin123',
            user: {
              _id: 'demo-admin-id',
              name: 'Admin User',
              email: 'admin@gmail.com',
              role: 'admin'
            }
          },
          'student@gmail.com': {
            password: 'student123',
            user: {
              _id: 'demo-student-id',
              name: 'Student User',
              email: 'student@gmail.com',
              role: 'student'
            }
          }
        };

        const demoUser = demoCredentials[formData.email];

        if (demoUser && demoUser.password === formData.password) {
          const userData = demoUser.user;

          // Store demo authentication data
          localStorage.setItem('token', 'demo-jwt-token');
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('role', userData.role);

          // Update AuthContext
          login(userData);

          // Navigate based on role
          if (userData.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/dashboard');
          }
          return;
        }
      }

      // If we reach here, authentication failed
      setError('Invalid email or password');

    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>📚 Attendance System Login</h2>
      {error && <p className="error">{error}</p>}

      <div className="demo-credentials">
        <h4>Demo Credentials:</h4>
        <p><strong>Admin:</strong> admin@gmail.com / admin123</p>
        <p><strong>Student:</strong> student@gmail.com / student123</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          value={formData.email}
          onChange={handleChange}
        />

        <label>Password</label>
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? '🔄 Logging in...' : '🚀 Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
