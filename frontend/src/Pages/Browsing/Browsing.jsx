import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Browsing.css';

function Browsing() {
  const [tables, setTables] = useState([]);
  const [tableColumns, setTableColumns] = useState({});
  const [tableData, setTableData] = useState({});

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

  const fetchColumns = async (tableName) => {
    try {
      const response = await axios.get(`http://localhost:5000/get-columns/${tableName}`);
      const columns = response.data.columns;
      setTableColumns(prevState => ({ ...prevState, [tableName]: columns }));
    } catch (error) {
      console.error(`Error fetching columns for table ${tableName}:`, error);
    }
  };

  const fetchData = async (tableName) => {
    try {
      const response = await axios.get(`http://localhost:5000/get-data/${tableName}`);
      const data = response.data.data;
      setTableData(prevState => ({ ...prevState, [tableName]: data }));
    } catch (error) {
      console.error(`Error fetching data for table ${tableName}:`, error);
    }
  };

  useEffect(() => {
    tables.forEach(table => {
      fetchColumns(table);
      fetchData(table);
    });
  }, [tables]);

  return (
    <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
      <h1>List Of Documented Entities</h1>
      {tables.sort().map((tableName, index) => (
        <div key={index} style={{ marginBottom: '20px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '5px' }}>{tableName}</h2>
          <table style={{ borderCollapse: 'collapse', border: '1px solid black' }}>
            <thead>
              <tr>
                {tableColumns[tableName]?.map((column, columnIndex) => (
                  <th key={columnIndex} style={{ border: '1px solid black', padding: '8px' }}>{column.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData[tableName]?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {tableColumns[tableName]?.map((column, columnIndex) => (
                    <td key={columnIndex} style={{ border: '1px solid black', padding: '8px'}}>{row[column.name]}</td>
                  ))}
                  <button className='edit'>edit</button>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default Browsing;
