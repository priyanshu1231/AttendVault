import React, { useState } from 'react';
import './PhotoModal.css';

const PhotoModal = ({ photo, studentName, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="photo-modal-overlay" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="photo-modal-header">
          <h3>📸 Attendance Photo - {studentName}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="photo-modal-controls">
          <button onClick={handleZoomIn} disabled={zoom >= 3}>
            🔍+ Zoom In
          </button>
          <button onClick={handleZoomOut} disabled={zoom <= 0.5}>
            🔍- Zoom Out
          </button>
          <button onClick={handleReset}>
            🔄 Reset
          </button>
          <span className="zoom-level">Zoom: {Math.round(zoom * 100)}%</span>
        </div>

        <div 
          className="photo-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={photo}
            alt={`Attendance photo for ${studentName}`}
            className="modal-photo"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            draggable={false}
          />
        </div>

        <div className="photo-modal-info">
          <p>💡 <strong>Tips:</strong></p>
          <ul>
            <li>Use zoom controls to examine details</li>
            <li>Drag the image when zoomed in</li>
            <li>Look for clear facial features and proper lighting</li>
            <li>Verify the photo matches the student's identity</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
