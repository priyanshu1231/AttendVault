import React, { useState } from "react";
import "./AttendanceMarking.css";

const AttendanceMarking = () => {
  const [studentId, setStudentId] = useState("");
  const [mode, setMode] = useState("in-person");
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState({ lat: "", long: "" });

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        });
      });
    } else {
      alert("Geolocation not supported.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("mode", mode);
    if (mode === "online") {
      formData.append("photo", photo);
      formData.append("lat", location.lat);
      formData.append("long", location.long);
    }

    try {
      const res = await fetch("http://localhost:5000/api/attendance/mark", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      alert("Failed to mark attendance");
    }
  };

  return (
    <div className="attendance-container">
      <h2>Mark Student Attendance</h2>
      <form onSubmit={handleSubmit}>
        <label>Student ID:</label>
        <input
          type="text"
          required
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <label>Attendance Mode:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="in-person">In-Person (In College)</option>
          <option value="online">Online (Location & Photo)</option>
        </select>

        {mode === "online" && (
          <>
            <label>Upload Live Photo:</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setPhoto(e.target.files[0])}
            />

            <button type="button" onClick={handleGetLocation}>
              Get Live Location
            </button>
            <p>Latitude: {location.lat}</p>
            <p>Longitude: {location.long}</p>
          </>
        )}

        <button type="submit">Mark Attendance</button>
      </form>
    </div>
  );
};

export default AttendanceMarking;
