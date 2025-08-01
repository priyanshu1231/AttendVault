import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>
      <nav>
        <ul>
          <li><a href="/admin-dashboard">Dashboard</a></li>
          <li><a href="/attendance">Mark Attendance</a></li>
          <li><a href="/students">View Students</a></li>
          <li><a href="/reports">Reports</a></li>
          <li><a href="/">Logout</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
