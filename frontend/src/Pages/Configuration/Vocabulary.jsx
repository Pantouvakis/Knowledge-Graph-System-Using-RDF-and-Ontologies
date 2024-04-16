import React, { useState, useEffect } from 'react';
import { createvTable, deletevTable } from '../../databaseUtils.js';
import axios from 'axios';
import './Styles.css';

function Vocabulary() {
  const [tableName, setTableName] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedVocabularyData, setSelectedVocabularyData] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [newRow, setNewRow] = useState('');
  const [Broader, setBroader] = useState('');

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
  
      // Fetch the updated list of tables after creating a new table
      const response = await axios.get('http://localhost:5000/get-vtables');
      const tableNames = response.data.tables;
      setTables(tableNames);
  
      // Clear the input field
      setTableName('');
  
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
      const rowId = selectedVocabularyData[rowIndex].ID;
      const updatedData = [...selectedVocabularyData];
      updatedData.splice(rowIndex, 1);
      setSelectedVocabularyData(updatedData);

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
        window.location.reload();
    } catch (error) {
        console.error('Error deleting table:', error);
    }
  };

  const handleInputChange = (e, rowIndex, colIndex) => {
    const { value } = e.target;
    const updatedData = [...selectedVocabularyData];
    updatedData[rowIndex][colIndex] = value;
    setSelectedVocabularyData(updatedData);
  };

  const handleInsert = async (selectedTable, newRowValue, broaderValue) => {
    if (!newRowValue || newRowValue.trim() === "") {
      alert(`Please write ${selectedTable}'s value.`);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/insert-vocabulary2`, {
        tableName: selectedTable,
        value: newRowValue,
        broader: broaderValue
      });
      if (response.data) {
        const newRow = { ID: response.data.id, Name: newRowValue, Broader: Broader };
        const updatedData = [...selectedVocabularyData, newRow];
        setSelectedVocabularyData(updatedData);
        setNewRow('');
        setBroader('');
      } else {
        console.error('Error inserting data:', response.data.error);
      }
    } catch (error) {
      console.error(`Error inserting ${newRowValue}:`, error);
    }
  };

  const handleEdit = async (rowIndex, selectedTable, columnName) => {
    try {
      if (rowIndex < 0 || rowIndex >= selectedVocabularyData.length) {
        console.error('Invalid row index:', rowIndex);
        return;
      }

      const rowId = selectedVocabularyData[rowIndex].ID;
      const currentValue = selectedVocabularyData[rowIndex][columnName];
      const newValue = window.prompt(`Enter new value for ${columnName}:`, currentValue);

      if (newValue === null || newValue.trim() === '') {
        return;
      }

      const updatedRowData = {
        ...selectedVocabularyData[rowIndex],
        [columnName]: newValue
      };

      const updatedData = selectedVocabularyData.map((row, index) => {
        if (index === rowIndex) {
          return updatedRowData;
        }
        return row;
      });

      setSelectedVocabularyData(updatedData);

      await axios.put(`http://localhost:5000/edit-vocabulary/${selectedTable}/${rowId}`, { name: newValue });

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
              placeholder='Mandatory Insertion Name'
              value={newRow}
              onChange={(e) => setNewRow(e.target.value)}
              style={{marginLeft: '10px'}}></input>
              <input
              placeholder='Optionally Broader'
              value={Broader}
              onChange={(e) => setBroader(e.target.value)}
              style={{marginLeft: '10px'}}></input>
            <button onClick={()=>handleInsert(selectedTable, newRow, Broader)}
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
                <th>Insertions:</th>
                <th>Broader:</th>
              </tr>
            </thead>
            <tbody>
            {selectedVocabularyData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.entries(row).map(([key, value], colIndex) => (
                  <td key={colIndex}>
                    {colIndex !== 0 ? (
                      <input type="text" value={value} onChange={(e) => handleInputChange(e, rowIndex, key)} />
                    ) : (
                      value
                    )}
                  </td>
                ))}
                <td><button onClick={() => handleEdit(rowIndex, selectedTable, 'Name')}>Save Changes</button></td>
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
