import React, { useState, useEffect } from 'react';
import { createvTable, deletevTable } from '../../databaseUtils.js';
import axios from 'axios';
import './Styles.css';
import Toast from './Toast';

function Vocabulary() {
  const [tableName, setTableName] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedVocabularyData, setSelectedVocabularyData] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [newRow, setNewRow] = useState('');
  const [broader, setBroader] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get-vtables');
      const tableNames = response.data.tables;
      setTables(tableNames);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      if (!tableName.trim()) {
        setMessage('Vocabulary name cannot be empty');
        return;
      }
      await createvTable(tableName);
      await fetchTables();
      setTableName('');
      setMessage(`${tableName} created successfully.`);
    } catch (error) {
      console.error('Error creating table:', error);
      setMessage('Error creating table');
    }
  };

  const handleSelectVocabulary = async (selectedTable) => {
    try {
      setSelectedTable(selectedTable);
      const response = await axios.post('http://localhost:5000/read-vdata', { tableName: selectedTable });
      setSelectedVocabularyData(response.data.data);
    } catch (error) {
      console.error('Error fetching vocabulary data:', error);
      setSelectedVocabularyData([]);
    }
  };

  const handleDeleteRow = async (rowIndex) => {
    try {
      const rowName = selectedVocabularyData[rowIndex].name;
      const updatedData = [...selectedVocabularyData];
      updatedData.splice(rowIndex, 1);
      setSelectedVocabularyData(updatedData);
      await axios.delete(`http://localhost:5000/delete-row/${selectedTable}/${rowName}`);
      setMessage('Deleted successfully.');
    } catch (error) {
      console.error('Error deleting row:', error);
      setMessage('Error deleting row');
    }
  };

  const handleDelete = async () => {
    try {
      await deletevTable(selectedTable);
      await fetchTables();
      setSelectedTable('');
      setSelectedVocabularyData([]);
      setMessage(`${selectedTable} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting table:', error);
      setMessage(`Error deleting ${selectedTable}`);
    }
  };

  const handleInputChange = (e, rowIndex, key) => {
    const { value } = e.target;
    const updatedData = [...selectedVocabularyData];
    updatedData[rowIndex][key] = value;
    setSelectedVocabularyData(updatedData);
  };

  const handleInsert = async () => {
    if (!newRow.trim()) {
      setMessage(`Please write ${selectedTable}'s value.`);
      return;
    }

    try {
      await axios.post('http://localhost:5000/insert-vocabulary2', {
        tableName: selectedTable,
        value: newRow,
        broader: broader
      });
      const newEntry = { name: newRow, broader: broader };
      setSelectedVocabularyData([...selectedVocabularyData, newEntry]);
      setNewRow('');
      setBroader('');
      setMessage(`${newRow} inserted successfully.`);
      await handleSelectVocabulary(selectedTable);
    } catch (error) {
      console.error(`Error inserting ${newRow}:`, error);
      setMessage('Error inserting row');
    }
  };

  const handleSave = async (rowIndex) => {
    try {
      const row = selectedVocabularyData[rowIndex];
      await axios.post('http://localhost:5000/save-vocabulary', {
        tableName: selectedTable,
        rowID: row.ID,
        name: row.name,
        broader: row.broader,
      });
      setMessage('Changes saved successfully.');
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage('Error saving data');
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
          placeholder="Enter new vocabulary name"
        />
        <div>
          <button className='create-new' type="submit">Create Vocabulary</button>
        </div>
      </form>

      {message && <Toast text={message} onClose={() => setMessage('')} />}

      <h3>Vocabularies That Exist Already</h3>
      <div>
        <b>Select Vocabulary: </b>
        <select onChange={(e) => handleSelectVocabulary(e.target.value)}>
          <option value="">Select a Vocabulary</option>
          {tables.map((table, index) => (
            <option key={index} value={table}>{table}</option>
          ))}
        </select>
        {selectedTable && (
          <>
            <input 
              placeholder='Mandatory Unique Name'
              value={newRow}
              onChange={(e) => setNewRow(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
            <input
              placeholder='Optionally Broader'
              value={broader}
              onChange={(e) => setBroader(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
            <button onClick={handleInsert} style={{ marginLeft: '10px' }}>INSERT</button>
            <button onClick={handleDelete} className='delete'>Delete Table</button>
          </>
        )}
      </div>

      {selectedVocabularyData && selectedVocabularyData.length > 0 && (
        <div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Insertions</th>
                <th>Broader</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedVocabularyData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([key, value], colIndex) => (
                    <td key={colIndex}>
                      {key === 'ID' ? (
                        <span>{value}</span>
                      ) : (
                        <input
                          type="text"
                          placeholder='Type here'
                          value={value}
                          onChange={(e) => handleInputChange(e, rowIndex, key)}
                        />
                      )}
                    </td>
                  ))}
                  <td>
                    <button onClick={() => handleSave(rowIndex)}>Save Changes</button>
                    <button onClick={() => handleDeleteRow(rowIndex)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Vocabulary;
