import React, { useState } from 'react';
import './MarkAttendance.css';

const MarkAttendance = () => {
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState('Present');
  const [message, setMessage] = useState('');

  const handleMark = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Attendance marked successfully!');
        setStudentId('');
        setStatus('Present');
      } else {
        setMessage(data.error || 'Failed to mark attendance');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error. Try again later.');
    }
  };

  return (
    <div className="mark-attendance">
      <h2>Mark Attendance</h2>
      <input
        type="text"
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
      </select>
      <button onClick={handleMark}>Submit</button>
      {message && <p className="mark-message">{message}</p>}
    </div>
  );
};

export default MarkAttendance;
