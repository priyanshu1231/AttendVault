import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminAttendanceVerification from "../components/AdminAttendanceVerification";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();

  // Fallback to localStorage if context is not available
  const fallbackUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = user || fallbackUser;
  const userRole = currentUser?.role || localStorage.getItem("role");

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser?.name || "User"}</h1>
        <p className="role-badge">Role: {userRole}</p>
      </div>

      <div className="dashboard-content">
        {(isAdmin || userRole === "admin") ? (
          <AdminAttendanceVerification />
        ) : (isStudent || userRole === "student") ? (
          <div className="student-dashboard">
            <h2>📚 Student Dashboard</h2>
            <p>Manage your attendance and academic activities</p>

            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>85%</h3>
                  <p>Attendance Rate</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>23</h3>
                  <p>Days Present</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❌</div>
                <div className="stat-info">
                  <h3>4</h3>
                  <p>Days Absent</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>1</h3>
                  <p>Pending</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-grid">
                <div className="action-card" onClick={() => navigate('/student/mark-attendance')}>
                  <div className="action-icon">📸</div>
                  <h4>Mark Attendance</h4>
                  <p>Take photo and submit attendance</p>
                </div>
                <div className="action-card" onClick={() => navigate('/student/my-attendance')}>
                  <div className="action-icon">📋</div>
                  <h4>My Attendance</h4>
                  <p>View attendance history</p>
                </div>
                <div className="action-card" onClick={() => navigate('/student/leave-request')}>
                  <div className="action-icon">📝</div>
                  <h4>Leave Request</h4>
                  <p>Submit leave application</p>
                </div>
                <div className="action-card" onClick={() => navigate('/profile')}>
                  <div className="action-icon">👤</div>
                  <h4>Profile</h4>
                  <p>Update personal information</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="unknown-role">
            <h2>Unknown Role</h2>
            <p>Please contact administrator for access.</p>
            <div className="dashboard-cards">
              <div className="card">Total Attendance Days: 75</div>
              <div className="card">Leaves Taken: 3</div>
              <div className="card">Pending Requests: 1</div>
              <div className="card">Role: {userRole || "Unknown"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
