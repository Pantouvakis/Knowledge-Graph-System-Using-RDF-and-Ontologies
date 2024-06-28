import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Browsing.css';
import Toast from '../../Toast.jsx';

function ListOfDocumentationEntities() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState({});
  const [connectionVocData, setConnectionVocData] = useState([]);
  const [vocData, setVocData] = useState({});
  const [vocOptions, setVocOptions] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/get-tables');
        setTables(response.data.tables);
      } catch (error) {
        setMessage('Error fetching tables');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const fetchVocInsertions = useCallback(async (tableName) => {
    if (tableName === "Remove") {
      return null;
    }
    try {
      const response = await axios.post('http://localhost:5000/read-names-vdata', { tableName });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      setMessage('Error fetching vocabulary insertions');
      return [];
    }
  }, []);

  const fetchEntityInsertions = useCallback(async (tableName) => {
    if (tableName === "Remove") {
      return null;
    }
    try {
      const response = await axios.post('http://localhost:5000/read-data', { tableName });
      const { data } = response.data;
      return Array.isArray(data)
        ? data.map(entry => ({ id: entry.ID, display: Object.values(entry).slice(1).join('-') }))
        : [];
    } catch (error) {
      setMessage(`Error fetching entity insertions for table "${tableName}"`);
      return [];
    }
  }, []);

  const handleSelectTable = useCallback(async (table) => {
    setLoading(true);
    try {
      setSelectedTable(table);
      const [tableResponse, connectionVocResponse] = await Promise.all([
        axios.post('http://localhost:5000/read-data', { tableName: table }),
        axios.get(`http://localhost:5000/get-connectionvoc/${table}`)
      ]);

      setTableData(tableResponse.data.data);
      setConnectionVocData(connectionVocResponse.data);

      const updatedVocOptions = {};
      for (const entry of connectionVocResponse.data) {
        if (entry.vocS === 2) {
          const entityInsertions = await fetchEntityInsertions(entry.vocT);
          updatedVocOptions[entry.tableC] = entityInsertions;
        }
      }
      setVocOptions(updatedVocOptions);
    } catch (error) {
      setTableData([]);
      setConnectionVocData([]);
      setMessage('Error fetching table data');
    } finally {
      setLoading(false);
    }
  }, [fetchEntityInsertions]);

  const handleEdit = useCallback(async (rowIndex) => {
    setEditingRowIndex(rowIndex);
    const rowData = tableData[rowIndex];
    setEditingRowData(rowData);

    const vocOptionsTemp = { ...vocOptions };
    const vocDataTemp = { ...vocData };

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

          const matchedOption = entityInsertions.find(option => option.id === value);
          if (matchedOption) {
            vocDataTemp[value] = matchedOption.display;
          }
        }
      }
    }
    setVocOptions(vocOptionsTemp);
    setVocData(vocDataTemp);
  }, [connectionVocData, fetchEntityInsertions, fetchVocInsertions, tableData, vocOptions, vocData]);

  const handleInputChange = useCallback((e, key) => {
    const updatedRowData = { ...editingRowData, [key]: e.target.value };
    setEditingRowData(updatedRowData);
  }, [editingRowData]);

  const handleSaveEdit = useCallback(async (rowIndex) => {
    try {
      const rowId = tableData[rowIndex].ID;
      let updatedRowData = { ...editingRowData };
  
      for (const key in updatedRowData) {
        if (updatedRowData[key] === '') {
          updatedRowData[key] = null;
        } else if (connectionVocData.find(entry => entry.tableC === key)?.vocS === 2) {
          if (typeof updatedRowData[key] === 'string') {
            updatedRowData[key] = updatedRowData[key].split('-')[0];
          }
        }
      }
  
      await axios.post('http://localhost:5000/update-data', {
        tableName: selectedTable,
        newData: updatedRowData,
        id: rowId,
      });
  
      const updatedTableData = [...tableData];
      updatedTableData[rowIndex] = { ...updatedTableData[rowIndex], ...updatedRowData };
  
      const updatedVocData = { ...vocData };
      for (const [key, value] of Object.entries(updatedRowData)) {
        const entry = connectionVocData.find(entry => entry.tableC === key);
        if (entry && entry.vocS === 2) {
          const matchedOption = vocOptions[key]?.find(option => option.id === value);
          if (matchedOption) {
            updatedVocData[value] = matchedOption.display;
            updatedTableData[rowIndex][key] = matchedOption.display; // Update the display value
          }
        }
      }
  
      setVocData(updatedVocData);
      setTableData(updatedTableData);
      setEditingRowIndex(null);
      setMessage('Row saved successfully');
    } catch (error) {
      setMessage('Error saving edit');
    }
  }, [connectionVocData, editingRowData, selectedTable, tableData, vocData, vocOptions]);
  
  
  

  const handleDelete = useCallback(async (rowIndex) => {
    try {
      const rowId = tableData[rowIndex].ID;
      await axios.delete(`http://localhost:5000/delete2-row/${selectedTable}/${rowId}`);

      const updatedTableData = tableData.filter((_, index) => index !== rowIndex);
      setTableData(updatedTableData);

      setMessage('Row deleted successfully');
    } catch (error) {
      setMessage('Error deleting row');
    }
  }, [selectedTable, tableData]);

const renderCellContent = useCallback((key, value, rowIndex) => {
  const entry = connectionVocData.find(entry => entry.tableC === key);
  const isEntity = entry?.vocS === 2;
  const isVocabulary = entry?.vocS === 1;

  let displayValue = value;
  let style = {};
  if (isEntity) {
    style = { color: 'blue' };
    displayValue = vocOptions[key]?.find(option => option.id === value)?.display || value;
  } else if (isVocabulary) {
    style = { color: 'red' };
    displayValue = vocData[value] || value;
  }

  if (value === null) {
    style.backgroundColor = 'lightgrey';
  }

  if (editingRowIndex === rowIndex && key !== 'ID') {
    if (isVocabulary) {
      return (
        <select
          value={editingRowData[key] ?? ''}
          onChange={(e) => handleInputChange(e, key)}
        >
          <option value="">Select</option>
          {(vocOptions[key] || []).map(option => (
            <option key={option.ID} value={option.ID}>{option.name}</option>
          ))}
        </select>
      );
    } else if (isEntity) {
      return (
        <select
          value={editingRowData[key] ?? ''}
          onChange={(e) => handleInputChange(e, key)}
        >
          <option value="">Select</option>
          {(vocOptions[key] || []).map(option => (
            <option key={option.id} value={option.id}>
              {option.display}
            </option>
          ))}
        </select>
      );
    } else {
      return (
        <input
          placeholder="Enter text"
          type="text"
          value={editingRowData[key] ?? ''}
          onChange={(e) => handleInputChange(e, key)}
        />
      );
    }
  } else {
    return displayValue !== null ? displayValue : '';
  }
}, [connectionVocData, editingRowData, editingRowIndex, handleInputChange, vocData, vocOptions]);


  return (
    <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
      <h1>List Of Documentation Entities</h1>
      <div>
        <b>Select Entity: </b>
        <select onChange={(e) => handleSelectTable(e.target.value)}>
          <option value="">Select Entity:</option>
          {tables.map((table, index) => (
            <option key={index} value={table}>{table}</option>
          ))}
        </select>
      </div>
      {loading && <div>Loading...</div>}
      {selectedTable && !loading && (
        <div>
          <table>
            <thead>
              <tr>
                {tableData.length > 0 && Object.keys(tableData[0]).map((columnName, index) => (
                  columnName !== 'ID' && <th key={index}>{columnName}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([key, value], colIndex) => (
                    key !== 'ID' && (
                      <td 
                        key={colIndex} 
                        style={{ 
                          color: connectionVocData.find(entry => entry.tableC === key)?.vocS === 2 ? 'blue' : 
                                connectionVocData.find(entry => entry.tableC === key)?.vocS === 1 ? 'red' : 
                                'black',
                          backgroundColor: value === null ? 'lightgrey' : 'white'
                        }}
                      >
                        {renderCellContent(key, value, rowIndex)}
                      </td>
                    )
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
      {message && <Toast text={message} onClose={() => setMessage('')} />}
    </div>
  );
}

export default ListOfDocumentationEntities;
