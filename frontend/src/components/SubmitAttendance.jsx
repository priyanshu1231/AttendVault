import React, { useState } from 'react';
import axios from 'axios';
import './SubmitAttendance.css';

const SubmitAttendance = () => {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [status, setStatus] = useState('');

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        alert('Unable to retrieve your location');
      }
    );
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!image || !location.latitude || !location.longitude) {
      alert('Please provide photo and location');
      return;
    }

    const formData = new FormData();
    formData.append('photo', image);
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);

    try {
      await axios.post('http://localhost:5000/api/attendance/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('Attendance Submitted Successfully');
    } catch (error) {
      console.error(error);
      setStatus('Submission Failed');
    }
  };

  return (
    <div className="submit-attendance">
      <h2>Submit Your Attendance</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={getLocation}>Get Current Location</button>
      {location.latitude && <p>Latitude: {location.latitude}</p>}
      {location.longitude && <p>Longitude: {location.longitude}</p>}
      <button onClick={handleSubmit}>Submit Attendance</button>
      {status && <p className="status">{status}</p>}
    </div>
  );
};

export default SubmitAttendance;
