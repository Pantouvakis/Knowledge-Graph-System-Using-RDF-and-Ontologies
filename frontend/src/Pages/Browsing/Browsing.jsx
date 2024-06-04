import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Browsing.css';

function Browsing() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [connectionVocData, setConnectionVocData] = useState([]);
  const [vocData, setVocData] = useState({});
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedID, setSelectedID] = useState('');

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

  const handleEntityClick = (id) => {

    setSelectedID(id);
  };

  return (
    <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
      <h1>Browsing</h1>
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
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([key, value], colIndex) => {
                    const entry = connectionVocData.find(entry => entry.tableC === key);
                    const isEntity = entry && entry.vocS === 2;
                    const isVocabulary = entry && entry.vocS === 1;
                    const isSelected = selectedID === value;

                    let displayValue = value;
                    let style = {};
                    if (isEntity ) {
                      style = { color: 'blue', cursor: 'pointer', fontWeight: isSelected ? 'bold' : 'normal' };
                    } else if (isVocabulary) {
                      style = { color: 'red' }
                      displayValue = vocData[value] || value;
                    }

                    return (
                      <td 
                        key={colIndex} 
                        style={style} 
                        onClick={() => isEntity && handleEntityClick(value)}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Browsing;
