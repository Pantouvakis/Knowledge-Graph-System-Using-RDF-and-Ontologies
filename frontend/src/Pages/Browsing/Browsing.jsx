import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Browsing.css';

function Browsing() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [tableData, setTableData] = useState([]);
  const [connectionVocData, setConnectionVocData] = useState([]);
  const [vocOptions, setVocOptions] = useState({});
  const [selectedID, setSelectedID] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchVocInsertions = useCallback(async (tableName) => {
    try {
      const response = await axios.post('http://localhost:5000/read-names-vdata', { tableName });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      setError('Error fetching vocabulary insertions');
      return [];
    }
  }, []);

  const fetchEntityInsertions = useCallback(async (tableName) => {
    try {
      const response = await axios.post('http://localhost:5000/read-data', { tableName });
      const { data } = response.data;
      return Array.isArray(data) ? data.map(entry => ({ id: entry.ID, display: Object.values(entry).slice(1).join('-') })) : [];
    } catch (error) {
      setError('Error fetching entity insertions');
      return [];
    }
  }, []);

  const fetchTableAndConnectionVoc = async (tableName) => {
    try {
      setLoading(true);
      setError(null);

      const [tableResponse, connectionVocResponse] = await Promise.all([
        axios.post('http://localhost:5000/read-data', { tableName }),
        axios.get(`http://localhost:5000/get-connectionvoc/${tableName}`)
      ]);

      setTableData(tableResponse.data.data);
      setConnectionVocData(connectionVocResponse.data);

      const updatedVocOptions = {};
      for (const entry of connectionVocResponse.data) {
        if (entry.vocS === 2) {
          const entityInsertions = await fetchEntityInsertions(entry.vocT);
          updatedVocOptions[entry.tableC] = entityInsertions;
        } else if (entry.vocS === 1) {
          const vocInsertions = await fetchVocInsertions(entry.vocT);
          updatedVocOptions[entry.tableC] = vocInsertions;
        }
      }
      setVocOptions(updatedVocOptions);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Error fetching data. Please try again.');
      setTableData([]);
      setConnectionVocData([]);
    }
  };

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-tables');
        setTables(response.data.tables);
      } catch (error) {
        setError('Error fetching tables.');
      }
    };
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableAndConnectionVoc(selectedTable);
    }
  }, [selectedTable]);

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setSelectedEntity(table);
    setSelectedID('');
    setCurrentPage(1); // Reset pagination on new table selection
  };

  const handleEntityClick = async (tableName, id) => {
    setSelectedTable(tableName);
    setSelectedEntity(tableName);
    setSelectedID(id);

    fetchTableAndConnectionVoc(tableName);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  return (
    <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
      <h1>Browsing</h1>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <b>Select Entity: </b>
        <select value={selectedEntity} onChange={(e) => handleSelectTable(e.target.value)}>
          <option value="">Select Entity:</option>
          {tables.map((table, index) => (
            <option key={index} value={table}>{table}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        selectedTable && (
          <div>
            <table>
              <thead>
                <tr>
                  {currentItems.length > 0 && Object.keys(currentItems[0]).map((columnName, index) => (
                    <th key={index}>{columnName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row, rowIndex) => {
                  const primaryKey = Object.keys(row).find(key => key.toLowerCase().includes('id')) || 'ID';

                  return (
                    <tr key={rowIndex} style={selectedID === row[primaryKey] ? { backgroundColor: 'yellow' } : {}}>
                      {Object.entries(row).map(([key, value], colIndex) => {
                        const entry = connectionVocData.find(entry => entry.tableC === key);
                        const isEntity = entry && entry.vocS === 2;
                        const isVocabulary = entry && entry.vocS === 1;

                        let displayValue = value;
                        let style = {};

                        if (isVocabulary) {
                          style = { color: 'red' };
                          displayValue = vocOptions[key]?.find(option => option.ID === value)?.name || value;
                        } else if (isEntity) {
                          style = { color: 'blue', cursor: 'pointer' };
                          displayValue = vocOptions[key]?.find(option => option.id === value)?.display || value;
                        }

                        if (value === null) {
                          style.backgroundColor = 'lightgrey';
                        }

                        return (
                          <td key={colIndex} style={style} onClick={() => isEntity && handleEntityClick(entry.vocT, value)}>
                            {displayValue !== null ? displayValue : ''}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  style={{ margin: '5px', padding: '5px', cursor: 'pointer' }}
                  disabled={currentPage === pageNumber}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <div><b>Note:</b> * Red column contains selections from Vocabulary.</div>
            <div>** Blue columns contain selections from Entities which you can select.</div>
          </div>
        )
      )}
    </div>
  );
}

export default Browsing;
