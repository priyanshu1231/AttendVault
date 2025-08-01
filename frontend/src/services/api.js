// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response interceptor to handle token expiration and network errors
API.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/';
    }

    // Enhanced error handling for network issues
    if (!error.response) {
      // Network error - server not reachable
      error.message = 'Network error. Please check your connection and ensure the server is running.';
    } else if (error.response.status >= 500) {
      // Server error
      error.message = 'Server error. Please try again later.';
    }

    return Promise.reject(error);
  }
);

// Enhanced photo attendance submission function
export const submitPhotoAttendance = async (attendanceData) => {
  try {
    console.log('📸 Submitting photo attendance:', {
      hasPhoto: !!attendanceData.photo,
      hasLocation: !!(attendanceData.latitude && attendanceData.longitude),
      studentId: attendanceData.studentId,
      studentName: attendanceData.studentName
    });

    const response = await API.post('/attendance/mark', attendanceData, {
      timeout: 30000, // 30 second timeout for photo uploads
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Photo attendance submitted successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Photo attendance submission failed:', error);
    throw error;
  }
};

export default API;
