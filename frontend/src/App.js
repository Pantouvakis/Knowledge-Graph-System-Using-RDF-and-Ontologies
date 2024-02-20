// App.js
//update
//insert
//read

import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [tableName, setTableName] = useState('');
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('');
  const [tables,setTables]=useState([]);
  const [error,setError]=useState(null);

  const handleCreateTable = async () => {
    try {
      await axios.post('http://localhost:5000/create-table', { tableName });
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Error creating table. See console for details.');
    }
  };

  const handleAddColumn = async () => {
    try {
      await axios.post('http://localhost:5000/add-column', { tableName, columnName, columnType });
    } catch (error) {
      console.error('Error adding column:', error);
      alert('Error adding column. See console for details.');
    }
  };

  const handleDeleteColumn = async () => {
    try {
      await axios.post('http://localhost:5000/delete-column', { tableName, columnName });
    } catch (error) {
      console.error('Error deleting column:', error);
      alert('Error deleting column. See console for details.');
    }
  };

  const handleDeleteTable = async () => {
    try {
      await axios.post('http://localhost:5000/delete-table', { tableName });
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Error deleting table. See console for details.');
    }
  };

  return (
    <div>
      <h1>Database Operations</h1>
      <div>
        <h2>Create Table</h2>
        <div>
          <input
            type="text"
            placeholder="Enter table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          <button onClick={handleCreateTable}>Create Table</button>
        </div>
      </div>
      <div>
        <h2>Add Column</h2>
        <div>
          <input
            type="text"
            placeholder="Enter table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter column name"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter column type"
            value={columnType}
            onChange={(e) => setColumnType(e.target.value)}
          />
          <button onClick={handleAddColumn}>Add Column</button>
        </div>
      </div>
      <div>
        <h2>Delete Column</h2>
        <div>
          <input
            type="text"
            placeholder="Enter table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter column name"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
          />
          <button onClick={handleDeleteColumn}>Delete Column</button>
        </div>
      </div>
      <div>
        <h2>Delete Table</h2>
        <div>
          <input
            type="text"
            placeholder="Enter table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          <button onClick={handleDeleteTable}>Delete Table</button>
        </div>
      </div>
    </div>
  );
}

export default App;
