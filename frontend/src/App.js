import React, { useState } from 'react';
import './App.css';
import CreateNewEntity from './Pages/CreateNewEntity';
import GeneralProperties from './Pages/GeneralProperties';
import EntryCategories from './Pages/EntryCategories';

function App() {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const [currentPage,setCurrentPage] = useState(null);
  const handleClick = (page)=>{
    setCurrentPage(page);
  };


  return (
    <nav className="navbar">
      <a href="#" id="Configuration" onClick={toggleDropdown}>
        Configuration
        {isDropdownOpen && (
          <div className="dropdown-content">
            <a href="#" onClick={()=>handleClick('GeneralProperties')} >General Properties</a>
            <a href="#" onClick={()=>handleClick('EntryCategories')}>Entity Categories</a>
            <a href="#"onClick={()=>handleClick('CreateNewEntity')}>Create New Entity</a>
            <a href="#"onClick={()=>handleClick('CreateNewEntity')}>Vocabularies</a>
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
      {currentPage === 'GeneralProperties' && <GeneralProperties />}
      {currentPage === 'EntryCategories' && <EntryCategories />}
      {currentPage === 'CreateNewEntity' && <CreateNewEntity />}
    </nav>
    
  );
}

export default App;
