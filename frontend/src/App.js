import React, { useState } from 'react';
import './App.css';
import ThreeInputPage from './generalProperties';
import generalProperties from './generalProperties';

function App() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showThreeInputPage, setShowgeneralProperties] = useState(false);

  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleGeneralPropertiesClick = (event) => {
    event.preventDefault();
    setShowgeneralProperties(true);
  };

  const handleGeneralPropertiesClick2 = (event) => {
    event.preventDefault();
    setShowgeneralProperties(false);
  };

  return (
    <div className="navbar">
      <a href="#" id="Configuration" onClick={toggleDropdown}>
        Configuration
        {isDropdownOpen && (
          <div className="dropdown-content">
            <a href="#" onClick={handleGeneralPropertiesClick} >General Properties</a>
            <a href="#" onClick={handleGeneralPropertiesClick2}>Entity Categories</a>
            <a href="#"onClick={handleGeneralPropertiesClick2}>Create New Entity</a>
            <a href="#"onClick={handleGeneralPropertiesClick2}>Vocabularies</a>
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
        )}
      </a>
      <a href="#" id="browsing" onClick={toggleDropdown}>
        Browsing
      </a>
      <a href="#" id="knowledgeGraph" onClick={toggleDropdown}>
        Knowledge Graph
      </a>
      {showThreeInputPage && <ThreeInputPage />}
    </div>
  );
}

export default App;
