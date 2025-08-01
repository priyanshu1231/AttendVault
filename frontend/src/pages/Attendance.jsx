import React, { useState } from "react";
import "./Attendance.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const MarkAttendance = () => {
  const [students] = useState([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Priya Sharma" },
    { id: 3, name: "Ravi Kumar" },
  ]);
  const [attendanceData, setAttendanceData] = useState({});
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  };

  const handlePhotoUpload = (e) => {
    setPhoto(URL.createObjectURL(e.target.files[0]));
  };

  const handleStatusChange = (id, status) => {
    setAttendanceData({ ...attendanceData, [id]: status });
  };

  const handleSubmit = () => {
    const finalData = students.map((s) => ({
      studentId: s.id,
      name: s.name,
      status: attendanceData[s.id] || "Absent",
      location,
      photo,
    }));
    console.log("Attendance Submitted:", finalData);
    alert("Attendance marked successfully!");
  };

  return (
    <div className="mark-attendance">
      <Sidebar />
      <div className="main-content">
        <Header title="Mark Attendance" />

        <div className="form-section">
          <h3>Upload Live Photo</h3>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          {photo && <img src={photo} alt="preview" className="preview-img" />}

          <h3>Capture Location</h3>
          <button onClick={handleLocation}>Get Current Location</button>
          {location && (
            <p>
              Latitude: {location.lat}, Longitude: {location.lng}
            </p>
          )}

          <h3>Mark Attendance</h3>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>
                    <select
                      onChange={(e) =>
                        handleStatusChange(student.id, e.target.value)
                      }
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="submit-btn" onClick={handleSubmit}>
            Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
