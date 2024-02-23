import React, { useState } from 'react';

const CreateNewEntity =() =>{  

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div style={{marginBottom: '20px',paddingTop: "100px",paddingLeft: "10px", gap: '10px'}}>
      <div>
        Select Entity Category:{isDropdownOpen && (
          <div className="dropdown-content">
            <a>1</a>
            <a>2</a>
            <a>3</a>
            <a>4</a>
            </div>
            )}
        <input type="text" color="darkgrey"></input>
      </div>
    </div>
  );
}

export default CreateNewEntity;
