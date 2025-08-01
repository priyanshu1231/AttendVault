import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAdmin, isStudent } = useAuth();

  // Fallback to localStorage if context is not available
  const fallbackUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = user || fallbackUser;
  const userRole = currentUser?.role || localStorage.getItem("role");

  // Don't render navbar if no user is logged in
  if (!currentUser?.name && !userRole) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <Link to="/" className="logo-link">
          📚 Attendance System
        </Link>
      </div>
      
      <div className="navbar__user-info">
        <span className="user-name">Welcome, {currentUser?.name || "User"}</span>
        <span className="user-role">{userRole}</span>
      </div>

      <ul className="navbar__links">
        {(isAdmin || userRole === "admin") && (
          <>
            <li><Link to="/admin-dashboard" className="nav-link">📊 Dashboard</Link></li>
            <li><Link to="/add-student" className="nav-link">➕ Add Student</Link></li>
            <li><Link to="/all-students" className="nav-link">👥 All Students</Link></li>
            <li><Link to="/admin/quick-attendance" className="nav-link">⚡ Quick Attendance</Link></li>
            <li><Link to="/reports" className="nav-link">📈 Reports</Link></li>
            <li><Link to="/admin/verify-attendance" className="nav-link">✅ Verify Attendance</Link></li>
          </>
        )}

        {(isStudent || userRole === "student") && (
          <>
            <li><Link to="/dashboard" className="nav-link">🏠 Dashboard</Link></li>
            <li><Link to="/student/mark-attendance" className="nav-link">📸 Mark Attendance</Link></li>
            <li><Link to="/student/my-attendance" className="nav-link">📋 My Attendance</Link></li>
            <li><Link to="/student/leave-request" className="nav-link">📝 Leave Request</Link></li>
          </>
        )}

        <li>
          <LogoutButton />
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
