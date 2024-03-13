import React, { useState, useEffect } from 'react';
import { createvTable } from '../../databaseUtils.js';
import axios from 'axios';
import './Styles.css';

function Vocabulary() {
  const [message, setMessage] = useState(null);
  const [tableName, setTableName] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedVocabularyData, setSelectedVocabularyData] = useState(null);
  
  // Fetch existing tables from server
  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await axios.get('http://localhost:5000/get-vtables');
        const tableNames = response.data.tables;
        setTables(tableNames);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    }

    fetchTables();
  }, []);

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

  const handleSelectVocabulary = async (selectedTable) => {
    try {
      const response = await axios.post('http://localhost:5000/read-vdata', { tableName: selectedTable });
      setSelectedVocabularyData(response.data.data);
    } catch (error) {
      console.error('Error fetching vocabulary data:', error);
      setSelectedVocabularyData(null);
    }
  };

  return (
    <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
      <h1>Create New Vocabulary</h1>
      <form onSubmit={handleCreateTable}>
        <input
          style={{ marginBottom: '20px', backgroundColor: 'lightgrey', width: '200px' }}
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Enter new vocabulary's name"
        />
        <div>
          <button className='create-new' type="submit">Create Vocabulary</button>
        </div>
      </form>
      
      <h3>Vocabularies That Exist Already</h3>
      <div>
        <b>Select Vocabulary: </b>
        <select onChange={(e) => handleSelectVocabulary(e.target.value)}>
          <option value="">Select a Vocabulary</option>
          {tables.map((table, index) => (
            <option key={index} value={table}>{table}</option>
          ))}
        </select>
      </div>

      {selectedVocabularyData && selectedVocabularyData.length > 0 && (
  <div>
    <h3>Data for Selected Vocabulary</h3>
    <table>
      <thead>
        <tr>
          {/* Assuming columns are keys of the first row */}
          {Object.keys(selectedVocabularyData[0]).map((column, index) => (
            <th key={index}>{column}</th>
          ))}
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {selectedVocabularyData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {Object.values(row).map((value, colIndex) => (
              <td key={colIndex}>{value !== null ? value : "N/A"}</td>
            ))}
            <td><button>edit</button></td>
            <td><button>delete</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


      
      {message && <p>{message}</p>}
    </div>
  );
}

export default Vocabulary;
