import React, { useEffect, useState } from 'react';
import './MyAttendanceHistory.css';

function MyAttendanceHistory() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/attendance/my', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setAttendanceData(data.records || []);
        } else {
          // If backend is not available, show mock data
          setAttendanceData(mockAttendanceData);
        }
      } catch (error) {
        console.error('Error fetching attendance history:', error);
        // If backend is not available, show mock data
        setAttendanceData(mockAttendanceData);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Mock data for demonstration
  const mockAttendanceData = [
    {
      timestamp: '2025-01-22T09:00:00Z',
      status: 'Present',
      location: '40.7128, -74.0060'
    },
    {
      timestamp: '2025-01-21T09:15:00Z',
      status: 'Late',
      location: '40.7128, -74.0060'
    },
    {
      timestamp: '2025-01-20T09:05:00Z',
      status: 'Present',
      location: '40.7128, -74.0060'
    },
    {
      timestamp: '2025-01-19T00:00:00Z',
      status: 'Absent',
      location: 'N/A'
    },
    {
      timestamp: '2025-01-18T08:55:00Z',
      status: 'Present',
      location: '40.7128, -74.0060'
    }
  ];

  return (
    <div className="my-attendance-history">
      <h2>My Attendance History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : attendanceData.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((entry, idx) => (
              <tr key={idx}>
                <td>{new Date(entry.timestamp).toLocaleDateString()}</td>
                <td>{new Date(entry.timestamp).toLocaleTimeString()}</td>
                <td>{entry.status}</td>
                <td>{entry.location || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyAttendanceHistory;
