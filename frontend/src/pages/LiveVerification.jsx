import React, { useEffect, useRef, useState } from "react";
import "./LiveVerification.css";

const LiveVerification = () => {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [imageData, setImageData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        alert("Location permission denied. Please enable location.");
        console.error(err);
      }
    );

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Camera error:", err));
    }
  }, []);

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL("image/png");
    setImageData(dataURL);
  };

  const handleSubmit = () => {
    if (!imageData || !location.lat || !location.lon) {
      alert("Please ensure both photo and location are captured.");
      return;
    }

    // Simulate backend API
    fetch("http://localhost:5000/api/verify-attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photo: imageData,
        location,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Attendance marked successfully!");
        setSubmitted(true);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to mark attendance");
      });
  };

  return (
    <div className="live-verification-container">
      <h2>Live Location & Photo Verification</h2>

      <div className="live-section">
        <div className="video-box">
          <video ref={videoRef} autoPlay />
          <button onClick={capturePhoto}>Capture Photo</button>
        </div>

        <div className="captured-image">
          <canvas ref={canvasRef} style={{ display: "none" }} />
          {imageData && <img src={imageData} alt="Captured" />}
        </div>

        <div className="location-info">
          <p><strong>Latitude:</strong> {location.lat}</p>
          <p><strong>Longitude:</strong> {location.lon}</p>
        </div>
      </div>

      <button className="submit-btn" onClick={handleSubmit} disabled={submitted}>
        {submitted ? "Submitted ✅" : "Submit Verification"}
      </button>
    </div>
  );
};

export default LiveVerification;
