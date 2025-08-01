import React from 'react';
import { Link } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
  return (
    <div className="student-dashboard">
      <h2>Welcome, Student</h2>
      <div className="student-actions">
        <Link to="/submit-attendance" className="student-link">Submit Attendance</Link>
        <Link to="/view-my-attendance" className="student-link">View My Attendance</Link>
        <Link to="/logout" className="student-link">Logout</Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
