import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import SessionManager from './components/SessionManager';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import StudentMarkAttendance from './pages/StudentMarkAttendance';
import AdminVerifyAttendance from './pages/AdminVerifyAttendance';
import AdminAttendance from './pages/Attendance';
import MarkAttendance from './pages/MarkAttendance';
import QuickAttendance from './pages/QuickAttendance';
import MyAttendanceHistory from './pages/MyAttendanceHistory';
import LeaveRequest from './pages/LeaveRequest';
import AttendanceMarking from './pages/AttendanceMarking';
import LeaveApproval from './pages/LeaveApproval';
import AttendanceReport from './pages/AttendanceReport';
import ProfilePage from './pages/ProfilePage';
import LiveVerification from './pages/LiveVerification';
import StudentDetails from './pages/StudentDetails';
import LeaveRequests from './pages/LeaveRequests';
import RemoteAttendance from './pages/RemoteAttendance';
import ReportGeneration from './pages/ReportGeneration';
import AddStudent from './pages/AddStudent';
import StudentList from './pages/StudentList';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <SessionManager>
          <Navbar />
          <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Student-only routes */}
        <Route
          path="/student/mark-attendance"
          element={
            <PrivateRoute>
              <StudentMarkAttendance />
            </PrivateRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/admin/verify-attendance"
          element={
            <PrivateRoute>
              <AdminVerifyAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/quick-attendance"
          element={
            <PrivateRoute>
              <QuickAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PrivateRoute>
              <AdminAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/mark-attendance"
          element={
            <PrivateRoute>
              <MarkAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/my-attendance"
          element={
            <PrivateRoute>
              <MyAttendanceHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-attendance"
          element={
            <PrivateRoute>
              <MyAttendanceHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/leave-request"
          element={
            <PrivateRoute>
              <LeaveRequest />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/leave-request"
          element={
            <PrivateRoute>
              <LeaveRequest />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance-marking"
          element={
            <PrivateRoute>
              <AttendanceMarking />
            </PrivateRoute>
          }
        />
        <Route
          path="/leave-approval"
          element={
            <PrivateRoute>
              <LeaveApproval />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance-report"
          element={
            <PrivateRoute>
              <AttendanceReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/live-verification"
          element={
            <PrivateRoute>
              <LiveVerification />
            </PrivateRoute>
          }
        />
        <Route
          path="/student-details"
          element={
            <PrivateRoute>
              <StudentDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/leave-requests"
          element={
            <PrivateRoute>
              <LeaveRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/remote-attendance"
          element={
            <PrivateRoute>
              <RemoteAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/report-generation"
          element={
            <PrivateRoute>
              <ReportGeneration />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-student"
          element={
            <PrivateRoute>
              <AddStudent />
            </PrivateRoute>
          }
        />
        <Route
          path="/all-students"
          element={
            <PrivateRoute>
              <StudentList />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <ReportGeneration />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/verify-attendance"
          element={
            <PrivateRoute>
              <AdminVerifyAttendance />
            </PrivateRoute>
          }
        />

        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </SessionManager>
      </Router>
    </AuthProvider>
  );
};

export default App;
