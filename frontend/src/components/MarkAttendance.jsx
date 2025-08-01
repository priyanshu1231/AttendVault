import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MarkAttendance.css';

const MarkAttendance = () => {
  const [students, setStudents] = useState([]);
  const [marked, setMarked] = useState({});

  useEffect(() => {
    axios.get('http://localhost:5000/api/users?role=student')
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleMark = (id, status) => {
    axios.post('http://localhost:5000/api/attendance/mark', {
      userId: id,
      status: status,
      date: new Date().toISOString().split('T')[0],
    }).then(() => {
      setMarked(prev => ({ ...prev, [id]: status }));
    }).catch(err => console.error(err));
  };

  return (
    <div className="mark-attendance">
      <h2>Mark Attendance</h2>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{marked[student._id] || 'Not Marked'}</td>
              <td>
                <button onClick={() => handleMark(student._id, 'Present')}>Present</button>
                <button onClick={() => handleMark(student._id, 'Absent')}>Absent</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarkAttendance;
