import React, { useEffect, useState } from 'react';
import './LeaveRequests.css';

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leave/requests');
      const data = await res.json();
      if (res.ok) {
        setLeaveRequests(data);
      } else {
        setMessage('Failed to fetch leave requests');
      }
    } catch (error) {
      console.error(error);
      setMessage('Server error');
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/leave/${action}/${id}`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Request ${action}ed successfully!`);
        fetchLeaveRequests();
      } else {
        setMessage(data.error || 'Action failed');
      }
    } catch (error) {
      console.error(error);
      setMessage('Server error');
    }
  };

  return (
    <div className="leave-requests">
      <h2>Leave Requests</h2>
      {message && <p className="leave-message">{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Reason</th>
            <th>From</th>
            <th>To</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((req) => (
            <tr key={req._id}>
              <td>{req.studentId}</td>
              <td>{req.reason}</td>
              <td>{req.fromDate}</td>
              <td>{req.toDate}</td>
              <td>{req.status}</td>
              <td>
                {req.status === 'Pending' && (
                  <>
                    <button
                      className="approve"
                      onClick={() => handleAction(req._id, 'approve')}
                    >
                      Approve
                    </button>
                    <button
                      className="reject"
                      onClick={() => handleAction(req._id, 'reject')}
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveRequests;
