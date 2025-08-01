import React, { useState, useEffect } from 'react';
import './Reports.css';

const Reports = () => {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportData, setReportData] = useState(null);

  // Mock data for demonstration
  const mockAttendanceData = {
    totalStudents: 150,
    presentToday: 142,
    absentToday: 8,
    lateToday: 5,
    attendanceRate: 94.7,
    weeklyStats: [
      { day: 'Monday', present: 145, absent: 5 },
      { day: 'Tuesday', present: 148, absent: 2 },
      { day: 'Wednesday', present: 142, absent: 8 },
      { day: 'Thursday', present: 147, absent: 3 },
      { day: 'Friday', present: 144, absent: 6 }
    ]
  };

  const mockLeaveData = {
    totalRequests: 25,
    approved: 18,
    pending: 5,
    rejected: 2,
    recentRequests: [
      { student: 'John Doe', type: 'Sick Leave', dates: '2025-01-20 to 2025-01-22', status: 'Approved' },
      { student: 'Jane Smith', type: 'Personal', dates: '2025-01-25', status: 'Pending' },
      { student: 'Mike Johnson', type: 'Emergency', dates: '2025-01-18', status: 'Approved' }
    ]
  };

  useEffect(() => {
    // Simulate data loading
    if (reportType === 'attendance') {
      setReportData(mockAttendanceData);
    } else {
      setReportData(mockLeaveData);
    }
  }, [reportType]);

  const generateReport = () => {
    console.log('Generating report:', {
      type: reportType,
      dateRange,
      customStartDate,
      customEndDate
    });
    
    // In a real app, this would make an API call
    alert(`Generating ${reportType} report for ${dateRange} period...`);
  };

  const exportReport = (format) => {
    console.log(`Exporting report as ${format}`);
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  const renderAttendanceReport = () => (
    <div className="report-content">
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Students</h4>
          <div className="stat-number">{reportData.totalStudents}</div>
        </div>
        <div className="stat-card">
          <h4>Present Today</h4>
          <div className="stat-number present">{reportData.presentToday}</div>
        </div>
        <div className="stat-card">
          <h4>Absent Today</h4>
          <div className="stat-number absent">{reportData.absentToday}</div>
        </div>
        <div className="stat-card">
          <h4>Attendance Rate</h4>
          <div className="stat-number rate">{reportData.attendanceRate}%</div>
        </div>
      </div>

      <div className="weekly-stats">
        <h4>Weekly Attendance Overview</h4>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {reportData.weeklyStats.map((day, index) => (
              <tr key={index}>
                <td>{day.day}</td>
                <td className="present">{day.present}</td>
                <td className="absent">{day.absent}</td>
                <td>{((day.present / (day.present + day.absent)) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLeaveReport = () => (
    <div className="report-content">
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Requests</h4>
          <div className="stat-number">{reportData.totalRequests}</div>
        </div>
        <div className="stat-card">
          <h4>Approved</h4>
          <div className="stat-number approved">{reportData.approved}</div>
        </div>
        <div className="stat-card">
          <h4>Pending</h4>
          <div className="stat-number pending">{reportData.pending}</div>
        </div>
        <div className="stat-card">
          <h4>Rejected</h4>
          <div className="stat-number rejected">{reportData.rejected}</div>
        </div>
      </div>

      <div className="recent-requests">
        <h4>Recent Leave Requests</h4>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Type</th>
              <th>Dates</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reportData.recentRequests.map((request, index) => (
              <tr key={index}>
                <td>{request.student}</td>
                <td>{request.type}</td>
                <td>{request.dates}</td>
                <td>
                  <span className={`status ${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="reports">
      <h3>Reports & Analytics</h3>
      
      <div className="report-controls">
        <div className="control-group">
          <label>Report Type:</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="control-select"
          >
            <option value="attendance">Attendance Report</option>
            <option value="leave">Leave Report</option>
          </select>
        </div>

        <div className="control-group">
          <label>Date Range:</label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="control-select"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {dateRange === 'custom' && (
          <div className="date-range">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="date-input"
            />
          </div>
        )}

        <div className="action-buttons">
          <button onClick={generateReport} className="generate-btn">
            Generate Report
          </button>
          <button onClick={() => exportReport('pdf')} className="export-btn">
            Export PDF
          </button>
          <button onClick={() => exportReport('excel')} className="export-btn">
            Export Excel
          </button>
        </div>
      </div>

      {reportData && (
        reportType === 'attendance' ? renderAttendanceReport() : renderLeaveReport()
      )}
    </div>
  );
};

export default Reports;
