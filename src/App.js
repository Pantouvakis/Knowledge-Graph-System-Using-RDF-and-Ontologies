import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [tableName, setTableName] = useState('');

  const handleCreateTable = async () => {
    try {
      await axios.post('http://localhost:5000/create-table', { tableName });
      alert(`Table ${tableName} creation initiated.`);
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Error creating table. See console for details.');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter table name"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
      />
      <button onClick={handleCreateTable}>Create Table</button>
    </div>
  );
}

export default App;
