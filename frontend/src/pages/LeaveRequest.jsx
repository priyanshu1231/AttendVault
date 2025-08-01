import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import API from '../services/api';
import './LeaveRequest.css';

const LeaveRequest = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    reason: '',
    startDate: '',
    endDate: '',
    supportingDocument: ''
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('submit');

  // Check if user is student
  const userRole = user?.role || localStorage.getItem("role");
  const isStudent = userRole === "student";

  useEffect(() => {
    if (isStudent) {
      fetchLeaveRequests();
    }
  }, [isStudent]);

  // Conditional redirect after hooks
  if (!isStudent) {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchLeaveRequests = async () => {
    try {
      const response = await API.get(`/leave/requests?studentId=${user?.email}&role=${user?.role}`);
      if (response.data.success) {
        setLeaveRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await API.post('/leave/request', {
        ...formData,
        studentId: user?.email,
        studentName: user?.name
      });

      if (response.data.success) {
        setMessage('✅ Leave request submitted successfully!');
        setFormData({
          reason: '',
          startDate: '',
          endDate: '',
          supportingDocument: ''
        });
        fetchLeaveRequests();
      }
    } catch (error) {
      setMessage('❌ Error submitting leave request: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#28a745';
      case 'Rejected': return '#dc3545';
      case 'Pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="leave-request-page">
      <div className="leave-request-container">
        <h2>📝 Leave Request Management</h2>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            Submit Request
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Request History
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {activeTab === 'submit' && (
          <div className="submit-section">
            <h3>Submit New Leave Request</h3>
            <form onSubmit={handleSubmit} className="leave-form">
              <div className="form-group">
                <label htmlFor="reason">Reason for Leave *</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  placeholder="Please provide a detailed reason for your leave request..."
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="supportingDocument">Supporting Document (Optional)</label>
                <input
                  type="text"
                  id="supportingDocument"
                  name="supportingDocument"
                  value={formData.supportingDocument}
                  onChange={handleChange}
                  placeholder="Link to supporting document or description"
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Submitting...' : '📤 Submit Leave Request'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <h3>Leave Request History</h3>
            {leaveRequests.length === 0 ? (
              <div className="no-requests">
                <p>No leave requests found</p>
              </div>
            ) : (
              <div className="requests-list">
                {leaveRequests.map((request) => (
                  <div key={request._id} className="request-card">
                    <div className="request-header">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {request.status}
                      </span>
                      <span className="request-date">
                        Submitted: {formatDate(request.submittedAt)}
                      </span>
                    </div>
                    
                    <div className="request-details">
                      <p><strong>Reason:</strong> {request.reason}</p>
                      <p><strong>Duration:</strong> {formatDate(request.startDate)} to {formatDate(request.endDate)}</p>
                      {request.supportingDocument && (
                        <p><strong>Supporting Document:</strong> {request.supportingDocument}</p>
                      )}
                      {request.reviewedAt && (
                        <p><strong>Reviewed:</strong> {formatDate(request.reviewedAt)} by {request.reviewedBy}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequest;
