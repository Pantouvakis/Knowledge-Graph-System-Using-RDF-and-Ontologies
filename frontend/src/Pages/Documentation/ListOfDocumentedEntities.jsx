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
    async function fetchTables() {
      try {
        const response = await axios.get('http://localhost:5000/get-tables');
        setTables(response.data.tables);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    }

    fetchTables();
  }, []);

  const handleSelectTable = async (table) => {
    try {
      setSelectedTable(table);
      const tableResponse = await axios.post('http://localhost:5000/read-data', { tableName: table });
      setTableData(tableResponse.data.data);

      const connectionVocResponse = await axios.get(`http://localhost:5000/get-connectionvoc/${table}`);
      setConnectionVocData(connectionVocResponse.data);
    } catch (error) {
      console.error('Error fetching table data:', error);
      setTableData([]);
      setConnectionVocData([]);
    }
  };

  const fetchVocInsertions = async (tableName) => {
    try {
      if (tableName === "Remove") {
        return null;
      } else {
        const response = await axios.post('http://localhost:5000/read-names-vdata', { tableName });
        return Array.isArray(response.data) ? response.data : []; // Ensure the response is an array
      }
    } catch (error) {
      console.error('Error fetching vocabulary insertions:', error);
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
                // Handling for entity fields (if needed)
                // Do something else for entity fields (if needed)
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
      let updatedRowData = editingRowData;
  
      // Check if the value is an empty string and modify it to NULL
      for (const key in updatedRowData) {
        if (updatedRowData[key] === '') {
          updatedRowData[key] = null;
        }
      }
  
      await axios.post('http://localhost:5000/update-data', {
        tableName: selectedTable,
        newData: updatedRowData,
        id: rowId,
      });
  
      const updatedTableData = [...tableData];
      updatedTableData[rowIndex] = updatedRowData;
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
      {selectedTable && selectedTable.length > 0 && (
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
                  {Object.entries(row).map(([key, value], colIndex) => {
                    const entry = connectionVocData.find(entry => entry.tableC === key);
                    const isEntity = entry && entry.vocS === 2;
                    const isVocabulary = entry && entry.vocS === 1;

                    let displayValue = value;
                    let style = {};
                    if (isEntity) {
                      style = { color: 'blue'};
                    } else if (isVocabulary) {
                      style = { color: 'red' };
                      displayValue = vocData[value] || value;
                    }

                    return (
                      <td key={colIndex} style={style}>
                        {editingRowIndex === rowIndex && key !== 'ID' ? (
                          isVocabulary ? (
                            <select
                              value={editingRowData[key]}
                              onChange={(e) => handleInputChange(e, key)}
                            >
                              <option value="">Remove</option>
                              {(vocOptions[key] || []).map(option => (
                                <option key={option.ID} value={option.ID}>{option.name}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={editingRowData[key]}
                              onChange={(e) => handleInputChange(e, key)}
                            />
                          )
                        ) : (
                          displayValue
                        )}
                      </td>
                    );
                  })}
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
