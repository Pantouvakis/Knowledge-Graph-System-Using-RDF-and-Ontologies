import React, { useState } from 'react';
import { createTable } from '../../databaseUtils.js';
import { useHistory } from 'react-router-dom';
import './Styles.css';

const CreateNewEntity2 = () => {
  const [message, setMessage] = useState(null);
  const [tableName, setTableName] = useState('');

  const handleCreateTable = async () => {
    try {
      if (!tableName.trim()) {
        throw new Error('Table name cannot be empty');
      }
      await createTable(tableName);
      alert('Entity created successfully.\nGo to Entity Categories if you need to update.');
      window.location.reload();
    } catch (error) {
      setMessage('Error creating table. See console for details.');
      console.error('Error creating table:', error);
    }
  };

  return (
    <div style={{ marginBottom: '20px', paddingTop: "50px", paddingLeft: "10px", gap: '10px' }}>
      <h1>Configuration Page - Create New Entity</h1>
      <form onSubmit={handleCreateTable}>
      <input
          style={{marginBottom: '20px', backgroundColor: 'lightgrey'}}
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Enter new entity 's name"
        />
        <div>
        <button  className='create-new'
        type="submit">Create Entity</button>
        </div>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateNewEntity2;
