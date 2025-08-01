import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import StudentAttendanceCapture from '../components/StudentAttendanceCapture';

const StudentMarkAttendance = () => {
  const { user, isStudent } = useAuth();
  
  // Fallback to localStorage if context is not available
  const fallbackUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role || fallbackUser?.role || localStorage.getItem("role");

  // Only allow students to access this page
  if (!isStudent && userRole !== "student") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="student-mark-attendance-page">
      <StudentAttendanceCapture />
    </div>
  );
};

export default StudentMarkAttendance;
