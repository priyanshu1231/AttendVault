import React, { useState, useRef, useEffect } from "react";
import "./StudentAttendanceCapture.css";
import { submitPhotoAttendance } from "../services/api";

// Simple address lookup function
const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AttendanceApp/1.0'
        }
      }
    );
    const data = await response.json();

    if (data.display_name) {
      return data.display_name;
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Address lookup failed:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

const StudentAttendanceCapture = () => {
  const [location, setLocation] = useState({ lat: '', lng: '', address: '' });
  const [imageData, setImageData] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState("Welcome! Please capture your photo and location to mark attendance.");
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Auto-start camera and location on component mount
    const initializeCapture = async () => {
      const hasPermission = await checkCameraPermissions();
      if (hasPermission) {
        await startCamera();
      }
      getCurrentLocation();
    };

    initializeCapture();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(true);
        setMessage("📷 Camera not supported on this device/browser.");
        return;
      }

      setMessage("📷 Starting camera...");

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user' // Front camera for selfies
        },
        audio: false
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Set up event handlers for video
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video metadata loaded');
          videoRef.current.play().then(() => {
            console.log('📹 Video playing');
            setCameraReady(true);
            setCameraError(false);
            setMessage("📷 Camera ready! Position yourself in the frame and capture your photo.");
          }).catch(err => {
            console.error('Error playing video:', err);
            setMessage("📷 Error starting video playback. Please try again.");
          });
        };

        videoRef.current.onloadeddata = () => {
          console.log('📹 Video data loaded');
        };

        videoRef.current.oncanplay = () => {
          console.log('📹 Video can play');
        };

        videoRef.current.onerror = (err) => {
          console.error('📹 Video error:', err);
          setMessage("📷 Video error occurred. Please refresh and try again.");
          setCameraError(true);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      let errorMessage = "📷 Camera access failed: ";

      if (err.name === 'NotAllowedError') {
        errorMessage += "Please allow camera access in your browser settings and refresh the page.";
      } else if (err.name === 'NotFoundError') {
        errorMessage += "No camera found on this device.";
      } else if (err.name === 'NotReadableError') {
        errorMessage += "Camera is being used by another application.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += "Camera constraints not supported.";
      } else {
        errorMessage += "Please check your camera permissions and try again.";
      }

      setCameraError(true);
      setCameraReady(false);
      setMessage(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  const requestCameraPermission = async () => {
    setCameraError(false);
    setMessage("📷 Requesting camera permission...");

    try {
      // First check if permissions API is available
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' });
        console.log('Camera permission status:', permission.state);

        if (permission.state === 'denied') {
          setMessage("📷 Camera access is blocked. Please click the camera icon in your browser's address bar and allow camera access, then refresh the page.");
          setCameraError(true);
          return;
        }
      }

      await startCamera();
    } catch (error) {
      console.error('Permission check failed:', error);
      await startCamera(); // Try anyway
    }
  };

  const checkCameraPermissions = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' });
        console.log('Initial camera permission:', permission.state);

        if (permission.state === 'granted') {
          setMessage("📷 Camera permission already granted. Starting camera...");
          return true;
        } else if (permission.state === 'denied') {
          setMessage("📷 Camera access is blocked. Please allow camera access in your browser settings.");
          setCameraError(true);
          return false;
        }
      }
      return true; // Unknown state, try anyway
    } catch (error) {
      console.error('Permission check error:', error);
      return true; // Try anyway if permission API fails
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(true);
      setMessage("📍 Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError(false);
    setMessage("📍 Getting your location...");

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const currentTime = new Date();

        console.log('Location obtained:', { latitude, longitude });

        // Get address from coordinates
        setMessage("📍 Getting address...");
        const address = await getAddressFromCoords(latitude, longitude);

        setLocation({
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
          address: address,
          datetime: `${currentTime.toLocaleDateString()} ${currentTime.toLocaleTimeString()}`
        });

        setLocationError(false);
        setLocationLoading(false);
        setMessage("📍 Location and address captured successfully!");
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationLoading(false);
        setLocationError(true);

        let errorMessage = "📍 Location access failed: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }
        setMessage(errorMessage);
      },
      options
    );
  };

  // Removed complex geocoding - keeping it simple

  // This stopCamera function is now handled by the enhanced stopCamera above

  const capturePhoto = () => {
    if (!videoRef.current) {
      setMessage("📷 Video element not found. Please refresh the page.");
      return;
    }

    if (!cameraReady) {
      setMessage("📷 Camera not ready. Please wait for camera to initialize.");
      return;
    }

    if (!canvasRef.current) {
      setMessage("📷 Canvas element not found. Please refresh the page.");
      return;
    }

    setIsCapturing(true);
    setMessage("📸 Capturing photo...");

    // Add a small delay to ensure video is fully loaded
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        // Check if video has valid dimensions
        if (!video.videoWidth || !video.videoHeight) {
          throw new Error("Video dimensions not available. Video may not be loaded properly.");
        }

        // Set canvas dimensions to match video
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        canvas.width = videoWidth;
        canvas.height = videoHeight;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Could not get canvas 2D context");
        }

        // Clear canvas first
        ctx.clearRect(0, 0, videoWidth, videoHeight);

        // Draw the video frame to canvas
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

        // Convert to base64 image data with good quality
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);

        if (imageDataUrl && imageDataUrl !== "data:," && imageDataUrl.length > 100) {
          setImageData(imageDataUrl);
          setMessage("📸 Photo captured successfully! You can retake if needed.");
        } else {
          throw new Error("Failed to capture image data or image is empty");
        }
      } catch (error) {
        console.error('❌ Error capturing photo:', error);
        setMessage(`📷 Failed to capture photo: ${error.message}`);
        // Reset capturing state on error
        setIsCapturing(false);
      } finally {
        // Always reset capturing state
        setTimeout(() => setIsCapturing(false), 500);
      }
    }, 100);
  };

  const retakePhoto = () => {
    console.log('🔄 Retaking photo...');
    setImageData(null);
    setIsCapturing(false);

    // Ensure camera is still running
    if (!cameraReady || !videoRef.current || !videoRef.current.srcObject) {
      console.log('📷 Camera not ready, restarting...');
      startCamera();
    } else {
      setMessage("📷 Camera ready! Position yourself and capture a new photo.");
    }
  };



  const handleSubmit = async () => {
    if (!location.lat || !location.lng || !imageData) {
      setMessage("Please capture both photo and location before submitting.");
      return;
    }

    setLoading(true);
    setMessage("Submitting your attendance...");

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      console.log('📸 Submitting photo attendance with enhanced API:', {
        latitude: location.lat,
        longitude: location.lng,
        address: location.address,
        studentId: user._id || user.id || user.email,
        studentName: user.name,
        photoSize: imageData ? imageData.length : 0,
        hasLocation: !!(location.lat && location.lng),
        hasPhoto: !!imageData
      });

      // Use enhanced API service
      const response = await submitPhotoAttendance({
        latitude: location.lat,
        longitude: location.lng,
        address: location.address,
        photo: imageData,
        studentId: user._id || user.id || user.email,
        studentName: user.name,
        datetime: location.datetime
      });

      console.log('✅ Enhanced API submission response:', response.data);

      if (response.data.success) {
        setMessage("✅ Attendance submitted successfully! Your submission is pending admin verification.");
        // Reset form
        setLocation({ lat: '', lng: '', address: '' });
        setImageData(null);
        // Restart camera for next submission
        setTimeout(() => {
          startCamera();
        }, 1000);
      } else {
        setMessage(`❌ Submission failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("❌ Enhanced API submission error:", error);

      // Enhanced error handling
      let errorMessage = "❌ Network error. Please check your connection and try again.";

      if (error.response) {
        // Server responded with error
        errorMessage = `❌ Server error: ${error.response.data?.message || error.message}`;
      } else if (error.request) {
        // Network error - server not reachable
        errorMessage = "❌ Cannot connect to server. Please ensure the backend is running on port 5000.";
      }

      setMessage(errorMessage);
    }
    setLoading(false);
  };

  // retakePhoto function is defined above

  return (
    <div className="student-capture">
      <h2>Submit Your Attendance</h2>
      <p>Capture your live photo and location to mark attendance</p>
      
      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="capture-section">
        <div className="camera-section">
          <h3>📸 Live Photo Capture</h3>
          {cameraError && !cameraReady ? (
            <div className="camera-error">
              <p>📷 Camera access is required to mark attendance</p>
              <div className="permission-instructions">
                <h4>How to enable camera access:</h4>
                <ol>
                  <li>Look for the 🔒 or 📷 icon in your browser's address bar</li>
                  <li>Click it and select "Allow" for camera</li>
                  <li>Refresh this page (F5)</li>
                </ol>
                <p><strong>Or try the button below:</strong></p>
              </div>
              <button
                onClick={requestCameraPermission}
                className="permission-btn"
              >
                🔓 Try Enable Camera
              </button>
              <button
                onClick={() => window.location.reload()}
                className="refresh-btn"
              >
                🔄 Refresh Page
              </button>
            </div>
          ) : !imageData ? (
            <div className="video-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                width="300"
                height="300"
                className="video-preview"
                style={{ display: cameraReady ? 'block' : 'none' }}
              />
              {!cameraReady && (
                <div className="camera-loading">
                  <p>📷 Initializing camera...</p>
                </div>
              )}
              <button
                onClick={capturePhoto}
                disabled={isCapturing || !cameraReady}
                className="capture-btn"
              >
                {isCapturing ? "📸 Capturing..." : "📷 Capture Photo"}
              </button>
            </div>
          ) : (
            <div className="photo-preview">
              <img src={imageData} alt="Captured" className="captured-image" />
              <div className="photo-actions">
                <button onClick={retakePhoto} className="retake-btn">
                  🔄 Retake Photo
                </button>
                <p className="photo-status">✅ Photo captured successfully!</p>
              </div>
            </div>
          )}
        </div>

        <div className="location-section">
          <h3>📍 Live Location Capture</h3>

          {locationError ? (
            <div className="location-error">
              <p>📍 Location access is required to mark attendance</p>
              <button
                onClick={getCurrentLocation}
                className="permission-btn"
              >
                🔓 Enable Location
              </button>
            </div>
          ) : locationLoading ? (
            <div className="location-loading">
              <p>📍 Getting your current location...</p>
              <div className="loading-spinner"></div>
            </div>
          ) : location.lat ? (
            <div className="location-display">
              <p>✅ Location captured successfully!</p>
              <div className="address-info">
                <div className="location-item">
                  <strong>📍 Address:</strong>
                  <p className="address-text">{location.address}</p>
                </div>

                <div className="location-item">
                  <strong>🌐 Coordinates:</strong>
                  <p className="coordinates">{location.lat}, {location.lng}</p>
                </div>

                <div className="location-item">
                  <strong>📅⏰ Date & Time:</strong>
                  <p className="datetime">{location.datetime}</p>
                </div>
              </div>

              <button
                onClick={getCurrentLocation}
                className="refresh-location-btn"
                disabled={locationLoading}
              >
                🔄 Refresh Location
              </button>
            </div>
          ) : (
            <div className="location-prompt">
              <p>📍 Location will be captured automatically</p>
              <button
                onClick={getCurrentLocation}
                className="location-btn"
                disabled={locationLoading}
              >
                📍 Get Current Location
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="submit-section">
        <div className="submit-status">
          <div className="status-item">
            <span className={`status-indicator ${imageData ? 'complete' : 'pending'}`}>
              {imageData ? '✅' : '⏳'}
            </span>
            <span>Photo: {imageData ? 'Captured' : 'Required'}</span>
          </div>
          <div className="status-item">
            <span className={`status-indicator ${location.lat ? 'complete' : 'pending'}`}>
              {location.lat ? '✅' : '⏳'}
            </span>
            <span>Location: {location.lat ? 'Captured' : 'Required'}</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!location.lat || !imageData || loading || locationLoading}
          className={`submit-btn ${(!location.lat || !imageData) ? 'disabled' : 'ready'}`}
        >
          {loading ? "📤 Submitting Attendance..." :
           (!location.lat || !imageData) ? "📋 Complete Requirements Above" :
           "✅ Submit Attendance"}
        </button>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default StudentAttendanceCapture;
