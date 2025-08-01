import React, { useEffect, useState } from 'react';
import './AttendanceReport.css';

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/attendance')
      .then((res) => res.json())
      .then((data) => setAttendanceData(data))
      .catch((err) => console.error('Failed to fetch attendance:', err));
  }, []);

  return (
    <div className="report-container">
      <h2 className="report-title">Attendance Report</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Date</th>
            <th>Time In</th>
            <th>Time Out</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((record) => (
            <tr key={record._id}>
              <td>{record.employeeName}</td>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>{record.timeIn}</td>
              <td>{record.timeOut}</td>
              <td>{record.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceReport;
