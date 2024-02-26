import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TableDropdown() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');

  useEffect(() => {
    fetchTableNames();
  }, []);

  const fetchTableNames = async () => {
    try {
      const response = await axios.get('/get-tables'); // Assuming you have an endpoint to fetch table names
      setTables(response.data.tables);
    } catch (error) {
      console.error('Error fetching table names:', error);
    }
  };

  const handleTableSelect = (e) => {
    setSelectedTable(e.target.value);
  };

  const handleCreateTable = async () => {
    try {
      const response = await axios.post('/create-table', { tableName: selectedTable });
      console.log(response.data.message);
      // You can add additional logic here, like updating state or showing a success message
    } catch (error) {
      console.error('Error creating table:', error);
      // You can handle errors here, like displaying an error message to the user
    }
  };

  return (
    <div>
      <select value={selectedTable} onChange={handleTableSelect}>
        <option value="">Select Table</option>
        {tables.map((table, index) => (
          <option key={index} value={table}>{table}</option>
        ))}
      </select>
      <button onClick={handleCreateTable}>Create Table</button>
    </div>
  );
}

export default TableDropdown;
