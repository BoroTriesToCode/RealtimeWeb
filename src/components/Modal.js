import React from 'react';
import './custom.css';

const Modal = ({ show, onClose, profile, onAccept, onDecline }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-button" onClick={() => { 
          console.log('Close button clicked');
          onClose();
        }}>x</button>
        <div className="modal-content">
          <h3>Profile of {profile.username}</h3>
          <p><strong>Age:</strong> {profile.age}</p>
          <p><strong>Country:</strong> {profile.country}</p>
          <p><strong>Language Level:</strong> {profile.languageLevel}</p>
          <p><strong>Bio:</strong> {profile.bio}</p>
          <div className="modal-actions">
            <button className="btn btn-success" onClick={onAccept}>Accept</button>
            <button className="btn btn-danger" onClick={onDecline}>Decline</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
