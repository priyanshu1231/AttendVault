import React, { useState, useEffect } from "react";
import API from '../services/api';
import "./AdminAttendanceVerification.css";

const AdminAttendanceVerification = () => {
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching pending attendance submissions...');

      const response = await API.get('/attendance/all');

      if (response.data.success) {
        // Filter only pending submissions
        const pendingData = response.data.data.filter(submission =>
          submission.status === 'Pending'
        );

        // Transform data to match expected format
        const transformedData = pendingData.map(submission => ({
          id: submission._id,
          studentId: submission.studentId.email,
          studentName: submission.studentId.name,
          photo: submission.photo,
          location: `${submission.location.lat},${submission.location.long}`,
          timestamp: submission.date,
          status: submission.status.toLowerCase()
        }));

        setPendingSubmissions(transformedData);
        console.log(`✅ Loaded ${transformedData.length} pending submissions`);
      } else {
        console.warn("No pending submissions found, using mock data");
        setPendingSubmissions(mockPendingData);
      }
    } catch (error) {
      console.error("❌ Error fetching submissions:", error);
      // For demo purposes, use mock data
      setPendingSubmissions(mockPendingData);
    }
    setLoading(false);
  };

  const handleVerification = async (submissionId, status, studentName) => {
    try {
      console.log(`🔄 ${status === 'approved' ? 'Approving' : 'Rejecting'} attendance for ${studentName}`);

      const response = await API.put(`/attendance/verify/${submissionId}`, {
        status: status === 'approved' ? 'Approved' : 'Rejected'
      });

      if (response.data.success) {
        setMessage(`✅ ${studentName}'s attendance ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
        // Remove the verified submission from the list
        setPendingSubmissions(prev => prev.filter(sub => sub.id !== submissionId));

        console.log(`✅ Attendance ${status} for ${studentName}`);

        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Failed to update attendance status");
      }
    } catch (error) {
      console.error("❌ Error verifying attendance:", error);
      setMessage("❌ Network error. Please try again.");
    }
  };

  const formatLocation = (locationString) => {
    if (!locationString) return "No location data";
    const [lat, lng] = locationString.split(',');
    return `Lat: ${parseFloat(lat).toFixed(4)}, Lng: ${parseFloat(lng).toFixed(4)}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Mock data for demonstration
  const mockPendingData = [
    {
      id: 1,
      studentId: "STU001",
      studentName: "John Doe",
      photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
      location: "40.7128,-74.0060",
      timestamp: "2025-01-22T09:15:30Z",
      status: "pending"
    },
    {
      id: 2,
      studentId: "STU002",
      studentName: "Jane Smith",
      photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
      location: "40.7589,-73.9851",
      timestamp: "2025-01-22T09:22:45Z",
      status: "pending"
    }
  ];

  if (loading) {
    return (
      <div className="admin-verification">
        <h2>Loading pending submissions...</h2>
      </div>
    );
  }

  return (
    <div className="admin-verification">
      <h2>📋 Attendance Verification</h2>
      <p>Review and verify student attendance submissions</p>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {pendingSubmissions.length === 0 ? (
        <div className="no-submissions">
          <h3>✅ No Pending Submissions</h3>
          <p>All attendance submissions have been verified.</p>
          <button onClick={fetchPendingSubmissions} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      ) : (
        <div className="submissions-grid">
          {pendingSubmissions.map((submission) => (
            <div key={submission.id} className="submission-card">
              <div className="student-info">
                <h3>{submission.studentName}</h3>
                <p className="student-id">ID: {submission.studentId}</p>
                <p className="timestamp">
                  📅 {formatTimestamp(submission.timestamp)}
                </p>
              </div>

              <div className="photo-section">
                <h4>📸 Submitted Photo</h4>
                <div className="photo-container">
                  <img
                    src={submission.photo}
                    alt={`${submission.studentName}'s attendance photo`}
                    className="submission-photo"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0xMDAgNzBDOTQuNDc3MiA3MCA5MCA3NC40NzcyIDkwIDgwQzkwIDg1LjUyMjggOTQuNDc3MiA5MCAxMDAgOTBDMTA1LjUyMyA5MCA1MCA4NS41MjI4IDExMCA4MEMxMTAgNzQuNDc3MiAxMDUuNTIzIDcwIDEwMCA3MFoiIGZpbGw9IiM2QzU3N0QiLz4KPHBhdGggZD0iTTcwIDEyMEg5MEw5NSAxMTBIMTA1TDExMCAxMjBIMTMwVjE0MEg3MFYxMjBaIiBmaWxsPSIjNkM1NzdEIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkM1NzdEIiBmb250LXNpemU9IjEyIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
                      e.target.alt = 'Image not found';
                    }}
                  />
                </div>
              </div>

              <div className="location-section">
                <h4>📍 Location Data</h4>
                <p className="location-text">
                  {formatLocation(submission.location)}
                </p>
                <a 
                  href={`https://maps.google.com/?q=${submission.location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  🗺️ View on Map
                </a>
              </div>

              <div className="verification-actions">
                <button 
                  onClick={() => handleVerification(submission.id, 'approved', submission.studentName)}
                  className="approve-btn"
                >
                  ✅ Approve
                </button>
                <button 
                  onClick={() => handleVerification(submission.id, 'rejected', submission.studentName)}
                  className="reject-btn"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="stats-section">
        <h3>📊 Today's Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{pendingSubmissions.length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceVerification;
