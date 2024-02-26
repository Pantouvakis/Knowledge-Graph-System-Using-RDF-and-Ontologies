import React, { useState,useEffect } from 'react';

const CreateNewEntity =() =>{  

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(()=>{
    fetchTables();
  },[]);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables'); // Adjust the endpoint accordingly
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }
      const data = await response.json();
      setTables(data.tables);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
  };

  return (
     <div style={{marginTop:"50px"}}>
       <label htmlFor="tableSelect">Select a table:</label>
        <select id="tableSelect" value={selectedTable} onChange={handleTableChange}>
          <option value="">Select a table</option>
          {tables.map((table, index) => (
            <option key={index} value={table}>
              {table}
            </option>
          ))}
        </select>
       {selectedTable && <p>You selected: {selectedTable}</p>}
      <div>
        <div>
        <button
        
        style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer',marginTop: "50px" }}>
        SAVE
        </button>
        <button
        
        style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer',marginTop: "50px", marginLeft: "10px" }}>
        DELETE
        </button>
      </div>
    </div>
    </div>
    
    
  );
}

export default CreateNewEntity;
