import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Browsing.css';

function ListOfDocumentedEntities() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const inputRef = useRef(null);

  // Fetch existing tables from server
  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await axios.get('http://localhost:5000/get-tables');
        const tableNames = response.data.tables;
        setTables(tableNames);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    }

    fetchTables();
  }, []);

  
  const handleSelectTable = async (selectedTable) => {
    try {
      setSelectedTable(selectedTable);
      const response = await axios.post('http://localhost:5000/read-data', { tableName: selectedTable });
      setTableData(response.data.data);
      
    } catch (error) {
      console.error('Error fetching vocabulary data:', error);
      setTableData(null);
    }
  };

  

  return (
    <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
      <h1>List Of Documented Entities</h1>
      <div>
        <b>Select Entity: </b>
        <select onChange={(e) => handleSelectTable(e.target.value)}>
          <option value="">Select an Entity:</option>
          {tables.map((table, index) => (
            <option key={index} value={table}>{table}</option>
          ))}
        </select>
        
      </div>
      
      {setSelectedTable && setSelectedTable.length > 0 && (
       
       <div>
          <table>
            <tbody>
            {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex}>{value}</td>
                  ))}
                  {/* Add edit and delete buttons here (see next steps) */}
                </tr>
              ))}
              
            </tbody>
          </table>
          
        </div>
      )}
    </div>
  );
}

export default ListOfDocumentedEntities;
