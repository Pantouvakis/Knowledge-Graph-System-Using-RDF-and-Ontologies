import React, { useState } from 'react';
import { createvTable } from '../../databaseUtils.js';
import './Styles.css';

function Vocabulary() {
  const [message, setMessage] = useState(null);
  const [tableName, setTableName] = useState('');

  const handleCreateTable = async () => {
    try {
      if (!tableName.trim()) {
        throw new Error('Vocabulary name cannot be empty');
      }
      await createvTable(tableName);
      alert('Entity created successfully.');
      window.location.reload();
    } catch (error) {
      setMessage('Error creating table. See console for details.');
      console.error('Error creating table:', error);
    }
  };
  return (
    <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
      <h1>Create New Vocabulary</h1>
      <form onSubmit={handleCreateTable}>
      <input
          style={{marginBottom: '20px', backgroundColor: 'lightgrey', width: '200px'}}
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Enter new vocabulary 's name"
        />
        <div>
        <button  className='create-new'
        type="submit">Create Vocabulary</button>
        </div>
      </form>
      <h1>Vocabularies That Exist Already</h1>
      <div><b>Select Vocabulary:</b></div>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Vocabulary;
