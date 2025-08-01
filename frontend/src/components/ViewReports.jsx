import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ViewReports.css';

const ViewReports = () => {
  const [reports, setReports] = useState([]);
  const [role, setRole] = useState('student'); // Assume role from login or props
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchReports();
  }, [filterDate]);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attendance/reports', {
        params: {
          role,
          date: filterDate,
        },
      });
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  return (
    <div className="view-reports">
      <h2>{role === 'admin' ? 'All Attendance Records' : 'My Attendance History'}</h2>

      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((record, index) => (
            <tr key={index}>
              <td>{record.name || 'N/A'}</td>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>{new Date(record.date).toLocaleTimeString()}</td>
              <td>
                {record.latitude}, {record.longitude}
              </td>
              <td>{record.status || 'Marked'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewReports;
