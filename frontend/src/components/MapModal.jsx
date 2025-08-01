import React, { useEffect, useRef } from 'react';
import './MapModal.css';

const MapModal = ({ location, address, studentName, onClose }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize map when component mounts
    initializeMap();
    
    // Cleanup when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [location]);

  const initializeMap = () => {
    // Check if Google Maps is available
    if (window.google && window.google.maps) {
      createGoogleMap();
    } else {
      // Fallback to OpenStreetMap or static map
      createFallbackMap();
    }
  };

  const createGoogleMap = () => {
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.long);

    const mapOptions = {
      center: { lat, lng },
      zoom: 16,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      streetViewControl: true,
      mapTypeControl: true,
      fullscreenControl: true,
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Add marker
    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: `${studentName}'s Attendance Location`,
      animation: window.google.maps.Animation.DROP,
    });

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 250px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">📍 Attendance Location</h4>
          <p style="margin: 5px 0;"><strong>Student:</strong> ${studentName}</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${address}</p>
          <p style="margin: 5px 0;"><strong>Coordinates:</strong> ${lat}, ${lng}</p>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">
            📅 ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    // Open info window by default
    infoWindow.open(map, marker);
  };

  const createFallbackMap = () => {
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.long);
    
    // Create a static map using OpenStreetMap
    mapRef.current.innerHTML = `
      <div class="fallback-map">
        <div class="map-header">
          <h4>📍 Location Map</h4>
          <p>Interactive map not available</p>
        </div>
        <div class="map-content">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}"
            width="100%"
            height="300"
            frameborder="0"
            style="border: 0;"
            allowfullscreen=""
            loading="lazy">
          </iframe>
        </div>
        <div class="map-info">
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Coordinates:</strong> ${lat}, ${lng}</p>
          <div class="map-actions">
            <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" rel="noopener noreferrer">
              🗺️ Open in Google Maps
            </a>
            <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16" target="_blank" rel="noopener noreferrer">
              🌍 Open in OpenStreetMap
            </a>
          </div>
        </div>
      </div>
    `;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const openInGoogleMaps = () => {
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.long);
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const openInAppleMaps = () => {
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.long);
    window.open(`http://maps.apple.com/?q=${lat},${lng}`, '_blank');
  };

  return (
    <div 
      className="map-modal-overlay" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="map-modal-header">
          <h3>🗺️ Attendance Location - {studentName}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="map-modal-info">
          <div className="location-details">
            <p><strong>📍 Address:</strong> {address}</p>
            <p><strong>🌐 Coordinates:</strong> {location.lat}, {location.long}</p>
            <p><strong>👤 Student:</strong> {studentName}</p>
          </div>
          
          <div className="map-actions">
            <button onClick={openInGoogleMaps} className="map-action-btn">
              🗺️ Google Maps
            </button>
            <button onClick={openInAppleMaps} className="map-action-btn">
              🍎 Apple Maps
            </button>
          </div>
        </div>

        <div className="map-container">
          <div ref={mapRef} className="map-element"></div>
        </div>

        <div className="map-modal-footer">
          <p>💡 <strong>Verification Tips:</strong></p>
          <ul>
            <li>Check if the location matches the expected attendance area</li>
            <li>Verify the accuracy of GPS coordinates</li>
            <li>Look for nearby landmarks or recognizable locations</li>
            <li>Consider GPS accuracy limitations (±3-5 meters typical)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
