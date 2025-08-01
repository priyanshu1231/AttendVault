import React, { useState } from 'react';
import './ReportGeneration.css';

const ReportGeneration = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/report?start=${startDate}&end=${endDate}`);
      const data = await res.json();
      if (res.ok) {
        setAttendanceData(data);
        setMessage('');
      } else {
        setMessage(data.error || 'Failed to fetch report');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error');
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Name', 'Date', 'Status'],
      ...attendanceData.map(row => [row.name, row.date, row.status])
    ]
      .map(e => e.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance_report.csv';
    link.click();
  };

  return (
    <div className="report-generation">
      <h2>Attendance Report</h2>
      <div className="filters">
        <label>
          From: <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          To: <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button onClick={fetchReports}>Generate Report</button>
        <button onClick={exportCSV}>Export CSV</button>
      </div>

      {message && <p className="msg">{message}</p>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.length === 0 ? (
            <tr><td colSpan="3">No records found</td></tr>
          ) : (
            attendanceData.map((record, idx) => (
              <tr key={idx}>
                <td>{record.name}</td>
                <td>{record.date}</td>
                <td>{record.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportGeneration;
