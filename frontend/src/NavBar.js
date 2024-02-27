import React, { useState } from 'react';
import './App.css';
import CreateNewEntity from './Pages/Configuration/CreateNewEntity';
import GeneralProperties from './Pages/Configuration/GeneralProperties';
import EntryCategories from './Pages/Configuration/EntryCategories';
import CreateNewEntity2 from './Pages/Documentation/CreateNewEntity2';
import ListOfDocumentedEntities from './Pages/Documentation/ListOfDocumentedEntities';
import Browsing from './Pages/Browsing/Browsing';

function NavBar() {

  
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };
  
    const [currentPage,setCurrentPage] = useState(null);
    const handleClick = (page)=>{
      setCurrentPage(page);
    };
  
    return (
      
      <nav className="navigation">
        <a href="#" id="Configuration" onClick={toggleDropdown}>
          Configuration
          {isDropdownOpen && (
            <div className="dropdown-content">
              <a href="#generalproperties" onClick={()=>handleClick('GeneralProperties')} >General Properties</a>
              <a href="#entrycategories" onClick={()=>handleClick('EntryCategories')}>Entity Categories</a>
              <a href="#createnewentity"onClick={()=>handleClick('CreateNewEntity')}>Create New Entity</a>
              <a href="#vocabularies"onClick={()=>handleClick('Vocabularies')}>Vocabularies</a>
            </div>
          )}
        </a>
        <a href="#" id="documentations" onClick={toggleDropdown}>
          Documentation
          {isDropdownOpen && (
            <div className="dropdown-content">
              <a href="#listofdocumentedentities" onClick={()=>handleClick('ListOfDocumentedEntities')}>List Of Documented Entities</a>
              <a href="#createnewentity2" onClick={()=>handleClick('CreateNewEntity2')}>Create New Entity</a>
            </div>
          )}
        </a>
        <a href="#browsing" onClick={()=>handleClick('Browsing')}>Browsing</a>
        <a href="#">Knowledge Graph</a>
  
      {currentPage === 'GeneralProperties' && <GeneralProperties />}
      {currentPage === 'EntryCategories' && <EntryCategories />}
      {currentPage === 'CreateNewEntity' && <CreateNewEntity />}
      {currentPage === 'CreateNewEntity2' && <CreateNewEntity2/>}
      {currentPage === 'ListOfDocumentedEnties' && <ListOfDocumentedEntities/>}
      {currentPage === 'Browsing' && <Browsing/>}
      </nav>
  
    );
  
  }
  
  export default NavBar;
  