import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Browsing.css';

function ListOfDocumentedEntities() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await axios.get('http://localhost:5000/get-tables');
        const tableNames = response.data.tables;
        setTables(tableNames);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    }

    fetchTables();
  }, []);

  const handleSelectTable = async (selectedTable) => {
    try {
      setSelectedTable(selectedTable);
      const response = await axios.post('http://localhost:5000/read-data', { tableName: selectedTable });
      setTableData(response.data.data);
    } catch (error) {
      console.error('Error fetching vocabulary data:', error);
      setTableData([]);
    }
  };

  const handleEdit = (rowIndex) => {
    setEditingRowIndex(rowIndex);
  };

  const handleSaveEdit = async (rowIndex) => {
    try {
      // Send edited data to server and update database
      const editedRowData = tableData[rowIndex]; // Replace this with edited data
      // Example: await axios.put(`http://localhost:5000/update-row/${selectedTable}/${rowId}`, editedRowData);

      // Update tableData state with edited row data
      const updatedTableData = [...tableData];
      updatedTableData[rowIndex] = editedRowData;
      setTableData(updatedTableData);

      setEditingRowIndex(null); // Reset editing state
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  const handleDelete = async (rowIndex) => {
    try {
      const rowId = tableData[rowIndex].ID; // Adjust this to match the primary key field name in your table
      await axios.delete(`http://localhost:5000/delete2-row/${selectedTable}/${rowId}`);
      
      // Remove the deleted row from the state
      const updatedTableData = tableData.filter((_, index) => index !== rowIndex);
      setTableData(updatedTableData);

      console.log('Delete row:', rowIndex);
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  return (
    <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
      <h1>List Of Documented Entities</h1>
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
                  {Object.entries(row).map(([key, value], colIndex) => (
                    <td key={colIndex}>
                      {editingRowIndex === rowIndex && key !== 'ID' ? (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => {
                            const updatedRowData = { ...row, [key]: e.target.value };
                            const updatedTableData = [...tableData];
                            updatedTableData[rowIndex] = updatedRowData;
                            setTableData(updatedTableData);
                          }}
                        />
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                  <td>
                    {editingRowIndex === rowIndex ? (
                      <button onClick={() => handleSaveEdit(rowIndex)}>Save</button>
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

export default ListOfDocumentedEntities;
