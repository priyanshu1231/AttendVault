import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import API from '../services/api';
import './QuickAttendance.css';

const QuickAttendance = () => {
  const { user, isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if user is admin
  const userRole = user?.role || localStorage.getItem("role");
  const isUserAdmin = isAdmin || userRole === "admin";

  useEffect(() => {
    if (isUserAdmin) {
      fetchStudents();
      fetchAttendanceForDate();
    }
  }, [isUserAdmin, selectedDate]);

  // Conditional redirect after hooks
  if (!isUserAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchStudents = async () => {
    try {
      console.log('🔄 Fetching students for QuickAttendance...');
      const response = await API.get('/users/students');
      console.log('📡 Students API Response:', response);

      if (response.data && response.data.success) {
        console.log('📚 Students data:', response.data.data);
        setStudents(response.data.data);
        setMessage('');
      } else {
        console.warn('⚠️ Students API response missing success flag');
        setMessage('⚠️ Failed to load students');
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      setMessage('❌ Error loading students');
    }
  };

  const fetchAttendanceForDate = async () => {
    try {
      const response = await API.get(`/attendance/daily/${selectedDate}`);
      if (response.data.success) {
        setAttendanceData(response.data.data.attendance || {});
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.email));
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      setLoading(true);
      console.log(`🔄 Marking attendance: ${studentId} - ${status} for ${selectedDate}`);

      const response = await API.post('/attendance/daily/mark', {
        date: selectedDate,
        studentId: studentId,
        status: status,
        markedBy: user?.name || 'Admin'
      });

      console.log('📡 Mark attendance response:', response);

      if (response.data && response.data.success) {
        setAttendanceData(prev => ({
          ...prev,
          [studentId]: response.data.data
        }));
        setMessage(`✅ Attendance marked: ${status} for ${studentId}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('⚠️ Attendance marked but response was unexpected');
      }
    } catch (error) {
      console.error('❌ Error marking attendance:', error);
      if (error.response) {
        console.error('❌ Error response:', error.response.data);
        setMessage(`❌ Failed to mark attendance: ${error.response.data.message || error.response.status}`);
      } else if (error.request) {
        console.error('❌ No response received:', error.request);
        setMessage('❌ No response from server. Is the backend running on port 5000?');
      } else {
        console.error('❌ Request setup error:', error.message);
        setMessage(`❌ Request error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const bulkMarkAttendance = async (status) => {
    if (selectedStudents.length === 0) {
      setMessage('❌ Please select students first');
      return;
    }

    setLoading(true);
    try {
      const attendanceArray = selectedStudents.map(studentId => ({
        studentId,
        status
      }));

      const response = await API.post('/attendance/daily/bulk-mark', {
        date: selectedDate,
        attendanceData: attendanceArray,
        markedBy: user?.name || 'Admin'
      });

      if (response.data.success) {
        // Update local state
        const newAttendanceData = { ...attendanceData };
        selectedStudents.forEach(studentId => {
          newAttendanceData[studentId] = {
            status,
            markedBy: user?.name || 'Admin',
            markedAt: new Date().toISOString(),
            type: 'manual'
          };
        });
        setAttendanceData(newAttendanceData);
        setSelectedStudents([]);
        setMessage(`✅ Bulk attendance marked: ${selectedStudents.length} students marked as ${status}`);
      }
    } catch (error) {
      setMessage('❌ Error in bulk marking: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (studentEmail) => {
    return attendanceData[studentEmail]?.status || 'Not Marked';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return '#28a745';
      case 'Absent': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="quick-attendance-page">
      <div className="quick-attendance-container">
        <h2>⚡ Quick Attendance Marking</h2>
        <p>Mark attendance for students quickly and efficiently</p>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="attendance-controls">
          <div className="date-selector">
            <label htmlFor="attendanceDate">Select Date:</label>
            <input
              type="date"
              id="attendanceDate"
              value={selectedDate}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="bulk-actions">
            <button 
              onClick={handleSelectAll}
              className="select-all-btn"
            >
              {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
            </button>
            <button 
              onClick={() => bulkMarkAttendance('Present')}
              className="bulk-present-btn"
              disabled={loading || selectedStudents.length === 0}
            >
              Mark Selected Present
            </button>
            <button 
              onClick={() => bulkMarkAttendance('Absent')}
              className="bulk-absent-btn"
              disabled={loading || selectedStudents.length === 0}
            >
              Mark Selected Absent
            </button>
          </div>
        </div>

        <div className="students-attendance-list">
          <div className="list-header">
            <h3>Students ({students.length})</h3>
            <p>Selected: {selectedStudents.length}</p>
          </div>

          {students.length === 0 ? (
            <div className="no-students">
              <p>No students found</p>
            </div>
          ) : (
            <div className="students-grid">
              {students.map((student) => {
                const status = getAttendanceStatus(student.email);
                const isSelected = selectedStudents.includes(student.email);
                
                return (
                  <div 
                    key={student._id} 
                    className={`student-attendance-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="student-info">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleStudentSelection(student.email)}
                        className="student-checkbox"
                      />
                      <div className="student-details">
                        <h4>{student.name}</h4>
                        <p>{student.studentId}</p>
                        <p>{student.email}</p>
                      </div>
                    </div>
                    
                    <div className="attendance-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(status) }}
                      >
                        {status}
                      </span>
                    </div>
                    
                    <div className="attendance-actions">
                      <button 
                        onClick={() => markAttendance(student.email, 'Present')}
                        className="present-btn"
                        disabled={loading}
                      >
                        Present
                      </button>
                      <button 
                        onClick={() => markAttendance(student.email, 'Absent')}
                        className="absent-btn"
                        disabled={loading}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickAttendance;
