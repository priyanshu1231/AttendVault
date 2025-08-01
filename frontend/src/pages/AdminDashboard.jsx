import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    pendingVerifications: 0,
    totalAttendance: 0
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get user data from localStorage as fallback
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Fetch dashboard statistics
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log('🔄 Fetching real dashboard statistics...');
      console.log('🌐 API Base URL:', API.defaults.baseURL);

      const response = await API.get('/dashboard/stats');
      console.log('📡 Raw API Response:', response);

      if (response.data && response.data.success) {
        const data = response.data.data;
        console.log('📊 Dashboard data received:', data);

        setStats({
          totalStudents: data.totalStudents || 0,
          presentToday: data.presentToday || 0,
          pendingVerifications: data.pendingAttendance || 0,
          totalAttendance: data.totalStudents > 0 ? ((data.presentToday / data.totalStudents) * 100).toFixed(1) : 0,
          absentToday: data.absentToday || 0,
          pendingLeaveRequests: data.pendingLeaveRequests || 0,
          attendanceTrends: data.attendanceTrends || []
        });
        console.log('✅ Dashboard stats updated successfully');
      } else {
        console.warn('⚠️ API response missing success flag or data');
        console.log('Response structure:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      // Try to fetch students count directly as fallback
      try {
        console.log('🔄 Trying fallback: fetching students directly...');
        const studentsResponse = await API.get('/users/students');
        if (studentsResponse.data && studentsResponse.data.success) {
          const studentCount = studentsResponse.data.data.length;
          console.log(`📚 Fallback: Found ${studentCount} students`);
          setStats({
            totalStudents: studentCount,
            presentToday: 0,
            pendingVerifications: 0,
            totalAttendance: 0,
            absentToday: 0,
            pendingLeaveRequests: 0,
            attendanceTrends: []
          });
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        setStats({
          totalStudents: 0,
          presentToday: 0,
          pendingVerifications: 0,
          totalAttendance: 0
        });
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Welcome back, {currentUser.name || 'Admin'}!</p>
        <button
          onClick={fetchDashboardStats}
          className="refresh-stats-btn"
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '10px'
          }}
        >
          🔄 Refresh Stats
        </button>
      </div>

      {/* Dashboard Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.presentToday}</h3>
            <p>Present Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingVerifications}</h3>
            <p>Pending Verifications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h3>{stats.totalAttendance}%</h3>
            <p>Overall Attendance</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <div className="action-card" onClick={() => navigate('/add-student')}>
            <div className="action-icon">➕</div>
            <h3>Add Student</h3>
            <p>Register a new student</p>
          </div>
          <div className="action-card" onClick={() => navigate('/all-students')}>
            <div className="action-icon">👥</div>
            <h3>All Students</h3>
            <p>View and manage students</p>
          </div>
          <div className="action-card" onClick={() => navigate('/admin/verify-attendance')}>
            <div className="action-icon">✅</div>
            <h3>Verify Attendance</h3>
            <p>Review pending submissions</p>
          </div>
          <div className="action-card" onClick={() => navigate('/reports')}>
            <div className="action-icon">📈</div>
            <h3>Generate Reports</h3>
            <p>View attendance analytics</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-time">2 minutes ago</span>
            <span className="activity-text">John Doe submitted attendance</span>
            <span className="activity-status pending">Pending</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">15 minutes ago</span>
            <span className="activity-text">Jane Smith submitted attendance</span>
            <span className="activity-status approved">Approved</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">1 hour ago</span>
            <span className="activity-text">Mike Johnson submitted leave request</span>
            <span className="activity-status pending">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
