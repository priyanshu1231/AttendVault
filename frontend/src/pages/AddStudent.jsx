import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import API from '../services/api';
import './AddStudent.css';

const AddStudent = () => {
  const { user, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    year: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if user is admin
  const userRole = user?.role || localStorage.getItem("role");
  const isUserAdmin = isAdmin || userRole === "admin";

  // Conditional redirect after hooks
  if (!isUserAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

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

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage('Name and email are required');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting student data:', formData);

      const response = await API.post('/users/students', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        studentId: formData.studentId.trim(),
        department: formData.department,
        year: formData.year,
        phone: formData.phone.trim()
      });

      console.log('Response:', response.data);

      if (response.data.success) {
        setMessage('✅ Student added successfully!');
        setFormData({
          name: '',
          email: '',
          studentId: '',
          department: '',
          year: '',
          phone: ''
        });
      } else {
        setMessage(response.data.message || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Error adding student. Please try again.';
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-student-page">
      <div className="add-student-container">
        <h2>➕ Add New Student</h2>
        <p>Create a new student account</p>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-student-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter student's full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="studentId">Student ID</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Enter student ID (optional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Year</label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <button
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Adding Student...' : '➕ Add Student'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
