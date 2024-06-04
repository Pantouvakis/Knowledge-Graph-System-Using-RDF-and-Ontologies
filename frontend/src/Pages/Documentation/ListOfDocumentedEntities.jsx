import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Browsing.css';

function ListOfDocumentationEntities() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState({});
  const [connectionVocData, setConnectionVocData] = useState([]);
  const [vocData, setVocData] = useState({});
  const [vocOptions, setVocOptions] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-tables');
        setTables(response.data.tables);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    fetchTables();
  }, []);

  const handleSelectTable = async (table) => {
    try {
      setSelectedTable(table);
      const [tableResponse, connectionVocResponse] = await Promise.all([
        axios.post('http://localhost:5000/read-data', { tableName: table }),
        axios.get(`http://localhost:5000/get-connectionvoc/${table}`)
      ]);

      setTableData(tableResponse.data.data);
      setConnectionVocData(connectionVocResponse.data);
    } catch (error) {
      console.error('Error fetching table data:', error);
      setTableData([]);
      setConnectionVocData([]);
    }
  };

  const fetchVocInsertions = async (tableName) => {
    if (tableName === "Remove") {
      return null;
    }
    try {
      const response = await axios.post('http://localhost:5000/read-names-vdata', { tableName });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching vocabulary insertions:', error);
      return [];
    }
  };

  const fetchEntityInsertions = async (tableName) => {
    if (tableName === "Remove") {
      return null;
    }
    try {
      const response = await axios.post('http://localhost:5000/read-data', { tableName });
      const { data } = response.data;
      const formattedData = Array.isArray(data)
        ? data.map(entry => Object.values(entry).join('-'))
        : [];
      return formattedData;
    } catch (error) {
      console.error(`Error fetching entity insertions for table "${tableName}":`, error);
      return [];
    }
  };

  const handleEdit = async (rowIndex) => {
    setEditingRowIndex(rowIndex);
    const rowData = tableData[rowIndex];
    setEditingRowData(rowData);

    const vocOptionsTemp = {};
    const vocDataTemp = {};

    for (const [key, value] of Object.entries(rowData)) {
      const entry = connectionVocData.find(entry => entry.tableC === key);
      if (entry) {
        if (entry.vocS === 1) {
          const vocInsertions = await fetchVocInsertions(entry.vocT);
          vocOptionsTemp[key] = vocInsertions;

          const matchedOption = vocInsertions.find(option => option.ID === value);
          if (matchedOption) {
            vocDataTemp[value] = matchedOption.name;
          }
        } else if (entry.vocS === 2) {
          const entityInsertions = await fetchEntityInsertions(entry.vocT);
          vocOptionsTemp[key] = entityInsertions;

          const matchedOption = entityInsertions.find(option => {
            const id = option.split('-')[0]; // Extract the ID from the formatted string
            return parseInt(id, 10) === value;
          });

          if (matchedOption) {
            vocDataTemp[value] = matchedOption;
          }
        }
      }
    }
    setVocOptions(vocOptionsTemp);
    setVocData(vocDataTemp);
  };

  const handleInputChange = (e, key) => {
    const updatedRowData = { ...editingRowData, [key]: e.target.value };
    setEditingRowData(updatedRowData);
  };

  const handleSaveEdit = async (rowIndex) => {
    try {
      const rowId = tableData[rowIndex].ID;
      let updatedRowData = { ...editingRowData };
  
      // Check if the value is an empty string and modify it to NULL
      for (const key in updatedRowData) {
        if (updatedRowData[key] === '') {
          updatedRowData[key] = null;
        } else if (connectionVocData.find(entry => entry.tableC === key)?.vocS === 2) {
          // Extract ID from formatted string
          updatedRowData[key] = updatedRowData[key].split('-')[0];
        }
      }
  
      await axios.post('http://localhost:5000/update-data', {
        tableName: selectedTable,
        newData: updatedRowData,
        id: rowId,
      });
  
      const updatedTableData = [...tableData];
      updatedTableData[rowIndex] = { ...updatedTableData[rowIndex], ...updatedRowData };
      setTableData(updatedTableData);
  
      setEditingRowIndex(null); // Reset editing state
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };
  

  const handleDelete = async (rowIndex) => {
    try {
      const rowId = tableData[rowIndex].ID;
      await axios.delete(`http://localhost:5000/delete2-row/${selectedTable}/${rowId}`);

      const updatedTableData = tableData.filter((_, index) => index !== rowIndex);
      setTableData(updatedTableData);

      console.log('Deleted row:', rowIndex);
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const renderCellContent = (key, value, rowIndex) => {
  const entry = connectionVocData.find(entry => entry.tableC === key);
  const isEntity = entry && entry.vocS === 2;
  const isVocabulary = entry && entry.vocS === 1;

  let displayValue = value;
  let style = {};
  if (isEntity) {
    style = { color: 'blue' };
    displayValue = vocOptions[key]?.find(option => option.split('-')[0] === value)?.name || value;
  } else if (isVocabulary) {
    style = { color: 'red' };
    displayValue = vocData[value] || value;
  }

  if (editingRowIndex === rowIndex && key !== 'ID') {
    if (isVocabulary) {
      return (
        <select
          value={editingRowData[key]}
          onChange={(e) => handleInputChange(e, key)}
        >
          <option value="">Remove</option>
          {(vocOptions[key] || []).map(option => (
            <option key={option.ID} value={option.ID}>{option.name}</option>
          ))}
        </select>
      );
    } else if (isEntity) {
      return (
        <select
          value={editingRowData[key]}
          onChange={(e) => handleInputChange(e, key)}
        >
          <option value="">Remove</option>
          {(vocOptions[key] || []).map(option => (
            <option key={option.split('-')[0]} value={option.split('-')[0]}>
              {option}
            </option>
          ))}
        </select>
      );
    } else {
      return (
        <input
          placeholder="Enter text"
          type="text"
          value={editingRowData[key]}
          onChange={(e) => handleInputChange(e, key)}
        />
      );
    }
  } else {
    return displayValue;
  }
};


  return (
    <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
      <h1>List Of Documentation Entities</h1>
      <div>
        <b>Select Entity: </b>
        <select onChange={(e) => handleSelectTable(e.target.value)}>
          <option value="">Select an Entity:</option>
          {tables.map((table, index) => (
            <option key={index} value={table}>{table}</option>
          ))}
        </select>
      </div>
      {selectedTable && (
        <div>
          <table>
            <thead>
              <tr>
                {tableData.length > 0 && Object.keys(tableData[0]).map((columnName, index) => (
                  <th key={index}>{columnName}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([key, value], colIndex) => (
                    <td key={colIndex} style={{ color: connectionVocData.find(entry => entry.tableC === key)?.vocS === 2 ? 'blue' : connectionVocData.find(entry => entry.tableC === key)?.vocS === 1 ? 'red' : 'black' }}>
                      {renderCellContent(key, value, rowIndex)}
                    </td>
                  ))}
                  <td>
                    {editingRowIndex === rowIndex ? (
                      <>
                        <button onClick={() => handleSaveEdit(rowIndex)}>Save</button>
                        <button onClick={() => setEditingRowIndex(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(rowIndex)}>Edit</button>
                        <button onClick={() => handleDelete(rowIndex)}>Delete</button>
                      </>
                    )}
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

export default ListOfDocumentationEntities;
