import React, { useState } from 'react';
import './RemoteAttendance.css';

const RemoteAttendance = () => {
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setMessage('Location fetched successfully!');
        },
        () => {
          setMessage('Location permission denied.');
        }
      );
    } else {
      setMessage('Geolocation is not supported by this browser.');
    }
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location || !photo) {
      setMessage('Please provide location and photo');
      return;
    }

    const formData = new FormData();
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);
    formData.append('photo', photo);

    try {
      const res = await fetch('http://localhost:5000/api/attendance/remote', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Remote attendance submitted successfully!');
        setLocation(null);
        setPhoto(null);
      } else {
        setMessage(data.error || 'Failed to submit attendance');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error');
    }
  };

  return (
    <div className="remote-attendance">
      <h2>Remote Attendance Submission</h2>
      <button onClick={getLocation}>Get Live Location</button>
      {location && (
        <p>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Upload Photo:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <button type="submit">Submit Attendance</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default RemoteAttendance;
