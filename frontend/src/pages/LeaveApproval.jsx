import React, { useEffect, useState } from "react";
import "./LeaveApproval.css";

const LeaveApproval = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/leave/all")
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch(() => alert("Failed to fetch leave requests"));
  }, []);

  const handleAction = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/leave/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      alert(data.message);
      setRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: status } : req
        )
      );
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="approval-container">
      <h2>Leave Requests</h2>
      {requests.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id}>
                <td>{req.studentId}</td>
                <td>{req.date}</td>
                <td>{req.reason}</td>
                <td>{req.status}</td>
                <td>
                  {req.status === "Pending" && (
                    <>
                      <button
                        className="approve"
                        onClick={() => handleAction(req._id, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="reject"
                        onClick={() => handleAction(req._id, "Rejected")}
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
      )}
    </div>
  );
};

export default LeaveApproval;
