import React, { useState, useRef } from 'react';
import './App.css';
import CreateNewEntity from './Pages/Configuration/CreateNewEntity';
import GeneralProperties from './Pages/Configuration/GeneralProperties';
import EntityCategories from './Pages/Configuration/EntityCategories';
import Vocabulary from './Pages/Configuration/Vocabulary';
import CreateNewEntity2 from './Pages/Documentation/CreateNewEntity2';
import ListOfDocumentedEntities from './Pages/Documentation/ListOfDocumentedEntities';
import Browsing from './Pages/Browsing/Browsing';
import KnowledgeGraph from './Pages/KnowledgeGraph/KnowledgeGraph';
import tinymce from 'tinymce';


function App() {

  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };
  
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
              <a href="#generalproperties" onClick={()=>handleClick('GeneralProperties')} >General Properties</a>
              <a href="#entitycategories" onClick={()=>handleClick('EntityCategories')}>Entity Categories</a>
              <a href="#createnewentity"onClick={()=>handleClick('CreateNewEntity')}>Create New Entity</a>
              <a href="#vocabulary"onClick={()=>handleClick('Vocabulary')}>Vocabulary</a>
            </div>
          )}
        </a>
      
        <a href="#" id="documentations" onClick={toggleDropdown}>
          Documentation
          {isDropdownOpen && (
            <div className="dropdown-content">
              <a href="#listofdocumentedentities" onClick={()=>handleClick('ListOfDocumentedEntities')}>List Of Documented Entities</a>
              <a href="#createnewentity2" onClick={()=>handleClick('CreateNewEntity2')}>Insert New Entity</a>
            </div>
          )}
        </a>
        <a href="#" id="browsing" onClick={()=>handleClick('Browsing')}>Browsing</a>
        <a href="#">Knowledge Graph</a>
        

      {currentPage === 'GeneralProperties' && <GeneralProperties />}
      {currentPage === 'EntityCategories' && <EntityCategories />}
      {currentPage === 'CreateNewEntity' && <CreateNewEntity />}
      {currentPage === 'Vocabulary' && <Vocabulary/>}
      {currentPage === 'CreateNewEntity2' && <CreateNewEntity2/>}
      {currentPage === 'ListOfDocumentedEntities' && <ListOfDocumentedEntities/>}
      {currentPage === 'Browsing' && <Browsing/>}
      {currentPage === 'KnowledgeGraph' && <KnowledgeGraph/>}
      </nav>
      
  
    );
  
  }
  
  export default App;
  