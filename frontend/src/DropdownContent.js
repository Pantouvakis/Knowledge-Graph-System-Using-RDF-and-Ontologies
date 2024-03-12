// DropdownContent.js
import React, { useState, useRef } from 'react';
import './App.css';



function DropdownContent({ children }) {
  return (
    <div className="dropdown-content">
      {children}
    </div>
  );
}

export default DropdownContent;
