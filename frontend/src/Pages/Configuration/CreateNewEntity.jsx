import React, { useState } from 'react';
import { createTable, addColumn, deleteColumn, deleteTable, readData, updateData } from '../../databaseUtils.js';
import './Styles.css';

const CreateNewEntity2 = () => {
  const [message, setMessage] = useState(null);
  const [tableName, setTableName] = useState('');
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('');

  //Create Table
  const handleCreateTable = async () => {
    try {
      await createTable(tableName);
    } catch (error) {
      setMessage('Error creating table. See console for details.');
      console.error('Error creating table:', error);
    }
  };

  //Delete Table
  const handleDeleteTable = async () => {
    try {
      await deleteTable(tableName);
    } catch (error) {
      setMessage('Error deleting table. See console for details.');
      console.error('Error deleting table:', error);
    }
  };

  const handleReadData = async () => {
    try {
      const data = await readData(tableName);
      setMessage(`Read data: ${JSON.stringify(data)}`);
    } catch (error) {
      setMessage('Error reading data. See console for details.');
      console.error('Error reading data:', error);
    }
  };

  //Create Column
  const handleAddColumn = async () => {
    try {
      await addColumn(tableName, columnName, columnType);
      setMessage('Column added successfully!');
    } catch (error) {
      setMessage('Error adding column. See console for details.');
      console.error('Error adding column:', error);
    }
  };

  //Delete Column
  const handleDeleteColumn = async () => {
    try {
      await deleteColumn(tableName, columnName);
      setMessage('Column deleted successfully!');
    } catch (error) {
      setMessage('Error deleting column. See console for details.');
      console.error('Error deleting column:', error);
    }
  };

  //Update
  const handleUpdateData = async () => {
    try {
      await updateData(tableName, { /* newData */ }, { /* condition */ });
      setMessage('Data updated successfully!');
    } catch (error) {
      setMessage('Error updating data. See console for details.');
      console.error('Error updating data:', error);
    }
  };

  return (
    <div style={{ marginBottom: '20px', paddingTop: "50px", paddingLeft: "10px", gap: '10px' }}>
        <h1>Configuration Page - Create New Entity</h1>
      <h4>
        <button className='create-new'
        onClick={handleCreateTable}>Create New Entity</button>
        <input type="text" value={tableName} onChange={(e) => 
          setTableName(e.target.value)} placeholder="Enter Entity's Name" />
        
        
      </h4>
      <div>
      <button className='submitDelete'
      onClick={handleDeleteTable}>Delete Entity</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateNewEntity2;