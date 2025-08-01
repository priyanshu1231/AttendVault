import React, { useState, useEffect } from 'react';
import './StudentList.css';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockStudents = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        studentId: 'STU001',
        phone: '+1234567890',
        department: 'Computer Science',
        year: '3rd Year',
        status: 'Active'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        studentId: 'STU002',
        phone: '+1234567891',
        department: 'Information Technology',
        year: '2nd Year',
        status: 'Active'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        studentId: 'STU003',
        phone: '+1234567892',
        department: 'Electronics',
        year: '4th Year',
        status: 'Active'
      },
      {
        id: 4,
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        studentId: 'STU004',
        phone: '+1234567893',
        department: 'Computer Science',
        year: '1st Year',
        status: 'Active'
      },
      {
        id: 5,
        name: 'David Brown',
        email: 'david.brown@example.com',
        studentId: 'STU005',
        phone: '+1234567894',
        department: 'Mechanical',
        year: '3rd Year',
        status: 'Inactive'
      }
    ];
    setStudents(mockStudents);
  }, []);

  // Filter students based on search term and department
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === '' || student.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleEdit = (studentId) => {
    console.log('Edit student:', studentId);
    // In a real app, this would open an edit form or navigate to edit page
    alert(`Edit functionality for student ID: ${studentId}`);
  };

  const handleDelete = (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(student => student.id !== studentId));
      console.log('Delete student:', studentId);
    }
  };

  const handleToggleStatus = (studentId) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, status: student.status === 'Active' ? 'Inactive' : 'Active' }
        : student
    ));
  };

  return (
    <div className="student-list">
      <h3>Student List</h3>
      
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="department-filter">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Business">Business</option>
          </select>
        </div>
      </div>

      <div className="student-count">
        Showing {filteredStudents.length} of {students.length} students
      </div>

      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Year</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No students found matching your criteria
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                  <td>{student.department}</td>
                  <td>{student.year}</td>
                  <td>
                    <span className={`status ${student.status.toLowerCase()}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(student.id)}
                        className="edit-btn"
                        title="Edit Student"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(student.id)}
                        className="toggle-btn"
                        title="Toggle Status"
                      >
                        {student.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="delete-btn"
                        title="Delete Student"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;
