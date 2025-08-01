import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import API from '../services/api';
import './StudentList.css';

const StudentList = () => {
  const { user, isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is admin
  const userRole = user?.role || localStorage.getItem("role");
  const isUserAdmin = isAdmin || userRole === "admin";

  useEffect(() => {
    fetchStudents();
  }, []);

  // Conditional redirect after hooks
  if (!isUserAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setMessage('🔄 Loading students from backend...');

      // Try to fetch from backend, fallback to mock data
      try {
        console.log('🌐 Fetching students from API...');
        const response = await API.get('/users/students');
        console.log('📡 API Response received:', response);

        // Handle different response structures
        let studentsData = [];
        if (response.data && Array.isArray(response.data)) {
          studentsData = response.data;
          console.log('✅ Using direct array from response.data');
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          studentsData = response.data.data;
          console.log('✅ Using response.data.data array');
        } else if (response.data && response.data.students && Array.isArray(response.data.students)) {
          studentsData = response.data.students;
          console.log('✅ Using response.data.students array');
        } else {
          console.warn('⚠️ Unexpected API response structure:', response.data);
          console.warn('🔄 Falling back to mock data');
          studentsData = mockStudents;
        }

        console.log(`📊 Setting ${studentsData.length} students from backend`);
        setStudents(studentsData);
        setMessage('');

      } catch (error) {
        console.error('❌ API Error:', error);
        console.log('🔄 Using mock data as fallback');
        setStudents(mockStudents);
        setMessage(`⚠️ Backend not available. Using ${mockStudents.length} demo students.`);
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      setMessage('❌ Error fetching students');
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockStudents = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'student@gmail.com',
      studentId: 'STU001',
      department: 'Computer Science',
      year: '3rd Year',
      phone: '+1234567890',
      createdAt: '2025-01-15T10:30:00Z'
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@gmail.com',
      studentId: 'STU002',
      department: 'Information Technology',
      year: '2nd Year',
      phone: '+1234567891',
      createdAt: '2025-01-14T09:15:00Z'
    },
    {
      _id: '3',
      name: 'Mike Johnson',
      email: 'mike@gmail.com',
      studentId: 'STU003',
      department: 'Electronics',
      year: '4th Year',
      phone: '+1234567892',
      createdAt: '2025-01-13T14:20:00Z'
    }
  ];

  const filteredStudents = Array.isArray(students) ? students.filter(student =>
    student && student.name && (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  ) : [];

  const deleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await API.delete(`/users/${studentId}`);
        if (Array.isArray(students)) {
          setStudents(students.filter(student => student._id !== studentId));
        }
        setMessage('Student deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        setMessage('Error deleting student');
      }
    }
  };

  if (loading) {
    return (
      <div className="student-list-page">
        <div className="loading">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="student-list-page">
      <div className="student-list-container">
        <div className="header">
          <h2>👥 All Students</h2>
          <p>Manage student accounts and information</p>
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search students by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="stats">
            <span className="student-count">
              Total Students: <strong>{filteredStudents.length}</strong>
            </span>
            <button
              onClick={fetchStudents}
              className="refresh-btn"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="students-grid">
          {filteredStudents.length === 0 ? (
            <div className="no-students">
              <p>No students found</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student._id} className="student-card">
                <div className="student-avatar">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="student-info">
                  <h3 className="student-name">{student.name}</h3>

                  <div className="student-details">
                    <div className="detail-row">
                      {student.studentId && (
                        <span className="student-id">ID: {student.studentId}</span>
                      )}
                      {student.department && (
                        <span className="department">{student.department}</span>
                      )}
                    </div>

                    <div className="detail-row">
                      {student.year && (
                        <span className="year">{student.year}</span>
                      )}
                      <span className="email">{student.email}</span>
                    </div>

                    {student.phone && (
                      <div className="detail-row">
                        <span className="phone">📞 {student.phone}</span>
                      </div>
                    )}

                    <div className="detail-row joined-row">
                      <span className="joined">
                        Joined: {new Date(student.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="student-actions">
                  <button 
                    className="delete-btn"
                    onClick={() => deleteStudent(student._id)}
                    title="Delete Student"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentList;
