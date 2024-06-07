import React, { useEffect } from 'react';
import './App.css';

function Toast({ text, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-container">
      <p>{text}</p>
    </div>
  );
}

export default Toast;
