import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import API from '../services/api';
import PhotoModal from '../components/PhotoModal';
import MapModal from '../components/MapModal';
import './AdminVerifyAttendance.css';

const AdminVerifyAttendance = () => {
  const { user, isAdmin } = useAuth();
  const [pendingAttendance, setPendingAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Check if user is admin
  const userRole = user?.role || localStorage.getItem("role");
  const isUserAdmin = isAdmin || userRole === "admin";

  useEffect(() => {
    if (isUserAdmin) {
      fetchPendingAttendance();
    }
  }, [isUserAdmin]);

  // Conditional redirect after hooks
  if (!isUserAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  const fetchPendingAttendance = async () => {
    try {
      setLoading(true);
      // Try to fetch from backend, fallback to mock data
      try {
        const response = await API.get('/attendance/all');
        console.log('Attendance API Response:', response.data);

        if (response.data.success) {
          const pendingRecords = response.data.data.filter(record => record.status === 'Pending');
          setPendingAttendance(pendingRecords);
        } else {
          setPendingAttendance(mockPendingData);
        }
      } catch (error) {
        console.log('Backend not available, using mock data:', error.message);
        // Fallback to mock data if backend not available
        setPendingAttendance(mockPendingData);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setMessage('Error fetching pending attendance');
      setPendingAttendance(mockPendingData);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockPendingData = [
    {
      _id: '1',
      studentId: { name: 'John Doe', email: 'student@gmail.com' },
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      location: { lat: '40.7128', long: '-74.0060' },
      address: '123 Main Street, New York, NY 10001',
      date: new Date().toISOString(),
      status: 'Pending'
    },
    {
      _id: '2',
      studentId: { name: 'Jane Smith', email: 'jane@gmail.com' },
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      location: { lat: '40.7589', long: '-73.9851' },
      address: '456 Broadway, New York, NY 10013',
      date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'Pending'
    },
    {
      _id: '3',
      studentId: { name: 'Mike Johnson', email: 'mike@gmail.com' },
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      location: { lat: '40.7505', long: '-73.9934' },
      address: '789 Times Square, New York, NY 10036',
      date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      status: 'Pending'
    }
  ];

  const verifyAttendance = async (attendanceId, status) => {
    try {
      setProcessingId(attendanceId);
      console.log(`Verifying attendance ${attendanceId} with status: ${status}`);

      const response = await API.put(`/attendance/verify/${attendanceId}`, { status });
      console.log('Verification response:', response.data);

      if (response.data.success) {
        // Update local state - remove from pending list
        setPendingAttendance(prev =>
          prev.filter(record => record._id !== attendanceId)
        );

        setMessage(`Attendance ${status.toLowerCase()} successfully!`);
      } else {
        setMessage(response.data.message || 'Error updating attendance status');
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error verifying attendance:', error);
      setMessage(error.response?.data?.message || 'Error updating attendance status');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const openPhotoModal = (photo, studentName) => {
    setSelectedPhoto({ photo, studentName });
  };

  const openMapModal = (location, address, studentName) => {
    setSelectedLocation({ location, address, studentName });
  };

  if (loading) {
    return (
      <div className="verify-attendance-page">
        <div className="loading">Loading pending attendance...</div>
      </div>
    );
  }

  return (
    <div className="verify-attendance-page">
      <div className="verify-container">
        <div className="header">
          <h2>✅ Verify Attendance</h2>
          <p>Review and approve student attendance submissions</p>
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="stats-bar">
          <div className="stat">
            <span className="stat-number">{pendingAttendance.length}</span>
            <span className="stat-label">Pending Reviews</span>
          </div>
        </div>

        <div className="attendance-grid">
          {pendingAttendance.length === 0 ? (
            <div className="no-pending">
              <div className="no-pending-icon">✅</div>
              <h3>All caught up!</h3>
              <p>No pending attendance submissions to review.</p>
            </div>
          ) : (
            pendingAttendance.map((record) => (
              <div key={record._id} className="attendance-card">
                <div className="card-header">
                  <div className="student-info">
                    <h3>{record.studentId?.name || 'Unknown Student'}</h3>
                    <p className="email">{record.studentId?.email}</p>
                    <p className="timestamp">
                      {new Date(record.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="status-badge pending">
                    {record.status}
                  </div>
                </div>

                <div className="card-content">
                  <div className="photo-section">
                    <h4>📸 Submitted Photo</h4>
                    <div className="photo-container">
                      <img
                        src={record.photo}
                        alt="Student attendance"
                        className="attendance-photo"
                        onClick={() => openPhotoModal(record.photo, record.studentId?.name)}
                      />
                      <button
                        className="view-photo-btn"
                        onClick={() => openPhotoModal(record.photo, record.studentId?.name)}
                      >
                        🔍 View Full Size
                      </button>
                    </div>
                  </div>

                  <div className="location-section">
                    <h4>📍 Location Details</h4>
                    <div className="location-info">
                      <p className="address">{record.address}</p>
                      <p className="coordinates">
                        Coordinates: {record.location?.lat}, {record.location?.long}
                      </p>
                      <button
                        className="view-map-btn"
                        onClick={() => openMapModal(record.location, record.address, record.studentId?.name)}
                      >
                        🗺️ View on Map
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="approve-btn"
                    onClick={() => verifyAttendance(record._id, 'Present')}
                    disabled={processingId === record._id}
                  >
                    {processingId === record._id ? '🔄 Processing...' : '✅ Approve'}
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => verifyAttendance(record._id, 'Absent')}
                    disabled={processingId === record._id}
                  >
                    {processingId === record._id ? '🔄 Processing...' : '❌ Reject'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto.photo}
          studentName={selectedPhoto.studentName}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Map Modal */}
      {selectedLocation && (
        <MapModal
          location={selectedLocation.location}
          address={selectedLocation.address}
          studentName={selectedLocation.studentName}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </div>
  );
};

export default AdminVerifyAttendance;
