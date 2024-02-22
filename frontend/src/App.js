import React, { useState } from 'react';
import './App.css';

function App() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="navbar">
      <a href="#" id="Configuration" onClick={toggleDropdown}>
        Configuration
        {isDropdownOpen && (
          <div className="dropdown-content">
            <a href="#" id="generalProperties">General Properties</a>
            <a href="#" id="entityCategories">Entity Categories</a>
            <a href="#" id="vocabularies">Vocabularies</a>
          </div>
        )}
      </a>
      <a href="#" id="documentations" onClick={toggleDropdown}>
        Documentation
        {isDropdownOpen && (
          <div className="dropdown-content">
            <a href="#" id="listOfDocumentedEntities">List Of Documented Entities</a>
            <a href="#" id="createNewEntity">Create New Entity</a>
          </div>
        )}</a>
      <a href="#" id="browsing" onClick={toggleDropdown}>
        Browsing
        {isDropdownOpen && (
          <div className="dropdown-content">
            <a href="#" id="generalProperties">General Properties</a>
            <a href="#" id="entityCategories">Entity Categories</a>
            <a href="#" id="vocabularies">Vocabularies</a>
          </div>
        )}</a>
      <a href="#" id="knwledgeGraph" onClick={toggleDropdown}>
        Knowledge Graph
        {isDropdownOpen && (
          <div className="dropdown-content">
            <a href="#" id="generalProperties">General Properties</a>
            <a href="#" id="entityCategories">Entity Categories</a>
            <a href="#" id="vocabularies">Vocabularies</a>
          </div>
        )}</a>
    </div>
  );
}

export default App;
