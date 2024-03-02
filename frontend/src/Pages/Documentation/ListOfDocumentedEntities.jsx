import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ListOfDocumentedEntities() {
  const [tables, setTables] = useState([]);
  const [tableColumns, setTableColumns] = useState({});

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

  useEffect(() => {
    tables.forEach(table => fetchColumns(table));
  }, [tables]);

  return (
    <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
      <h1>List Of Documented Entities</h1>
      {/*bring tables sorted*/}
      {tables.sort().map((tableName, index) => (
        <div key={index}>
          <div style={{fontWeight: 'bold'}}>{tableName}:</div>
          <ul style={{marginTop: '-3px'}}>
            {tableColumns[tableName]?.map((column, index) => (
              <li
              key={index}>{column.name} [{column.dataType}]</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default ListOfDocumentedEntities;
