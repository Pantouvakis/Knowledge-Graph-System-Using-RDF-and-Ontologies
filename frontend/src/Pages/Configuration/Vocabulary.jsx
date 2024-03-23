import React, { useState, useEffect, useRef } from 'react';
import { createvTable, deletevTable } from '../../databaseUtils.js';
import axios from 'axios';
import './Styles.css';

function Vocabulary() {
  const [tableName, setTableName] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedVocabularyData, setSelectedVocabularyData] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [newRow, setNewRow] = useState(null);
  const inputRef = useRef(null);

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
      console.error('Error creating table:', error);
    }
  };

  const handleSelectVocabulary = async (selectedTable) => {
    try {
      setSelectedTable(selectedTable);
      const response = await axios.post('http://localhost:5000/read-vdata', { tableName: selectedTable });
      setSelectedVocabularyData(response.data.data);
      
    } catch (error) {
      console.error('Error fetching vocabulary data:', error);
      setSelectedVocabularyData(null);
    }
  };

  const handleDeleteRow = async (rowIndex, selectedTable) => {
    try {

      const rowId = selectedVocabularyData[rowIndex].ID; // Assuming ID is the identifier for the row
      const updatedData = [...selectedVocabularyData];
      updatedData.splice(rowIndex, 1); // Remove the row from the array
      setSelectedVocabularyData(updatedData); // Update the state to reflect the deletion
      // Send a request to the server to delete the row from the database

      await axios.delete(`http://localhost:5000/delete-row/${selectedTable}/${rowId}`);

    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const handleDelete = async () => {
    try {
        await deletevTable(selectedTable);
        console.log('Table deleted successfully');
        alert('Vocabulary deleted successfully.');
        window.location.reload(); // Refresh the page after deletion
    } catch (error) {
        console.error('Error deleting table:', error);
    }
};
  

const handleInsert = async (selectedTable, newRowValue) => {
  if (!newRowValue || newRowValue.trim() === "") {
    alert(`Please write ${selectedTable}'s value.`);
    return; // Exit function early if no value is provided
  }

  try {
    const response = await axios.post(`http://localhost:5000/insert-vocabulary/${selectedTable}/${newRowValue}`);
    if (response.data) {
      console.log('Data inserted successfully.');

      // Construct a new row object
      const newRow = { ID: response.data.id, Name: newRowValue }; // Assuming 'Name' is the key for the column where new values are inserted

      // Update state with the new row
      const updatedData = [...selectedVocabularyData, newRow];
      setSelectedVocabularyData(updatedData);

      setNewRow(''); // Clear input on success
      inputRef.current.value = '';
    } else {
      console.error('Error inserting data:', response.data.error);
    }
  } catch (error) {
    console.error(`Error inserting ${newRowValue}:`, error);
  }
};

const handleEdit = async (rowIndex, selectedTable, columnName) => {
  try {
    // Ensure rowIndex is valid
    if (rowIndex < 0 || rowIndex >= selectedVocabularyData.length) {
      console.error('Invalid row index:', rowIndex);
      return;
    }

    const rowId = selectedVocabularyData[rowIndex].ID;
    const currentValue = selectedVocabularyData[rowIndex][columnName];
    const newValue = window.prompt(`Enter new value for ${columnName}:`, currentValue);

    // If the user cancels the prompt or enters an empty value, exit early
    if (newValue === null || newValue.trim() === '') {
      return;
    }

    // Construct the updated row data with the new value for the specified column
    const updatedRowData = {
      ...selectedVocabularyData[rowIndex], // Copy the existing row data
      [columnName]: newValue // Update the specified column with the new value
    };

    // Update the state to reflect the edited row immediately
    const updatedData = [...selectedVocabularyData];
    updatedData[rowIndex] = updatedRowData;
    setSelectedVocabularyData(updatedData);
    
    try{
      await axios.put(`http://localhost:5000/edit-vocabulary/${selectedTable}/${rowId}`, { name: newValue });
      console.log('Row edited successfully');
    }
    catch (error){
      console.error('Error editing row:',error);
    }
    console.log('Row edited successfully.');
  } catch (error) {
    console.error('Error editing row:', error);
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
        {selectedTable !== "" && (
          <>
            <input 
              ref={inputRef}
              onChange={(e) => setNewRow(e.target.value)}
              style={{marginLeft: '10px'}}></input>
            <button onClick={()=>handleInsert(selectedTable, newRow)}
              style={{marginLeft: '10px'}}>INSERT</button>
            <button onClick={handleDelete}
              className='delete'
              >Delete Table</button>
          </>
          
        )}
      </div>
      
      {selectedVocabularyData && selectedVocabularyData.length > 0 && (
       
       <div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vocabulary Insertions:</th>
              </tr>
            </thead>
            <tbody>
              {selectedVocabularyData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex}>{value}</td>
                  ))}
                  <td><button onClick={() => handleEdit(rowIndex, selectedTable, 'name')}>Edit</button></td>
                  <td><button onClick={() => handleDeleteRow(rowIndex, selectedTable)}>Delete</button></td>
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
