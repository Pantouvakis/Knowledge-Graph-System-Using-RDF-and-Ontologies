import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Popup from './AddColumn.jsx';
import './Styles.css';
import { deleteColumn, deleteTable, createTable } from '../../databaseUtils.js';

function EntityCategories() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableColumns, setTableColumns] = useState([]);
    const [columnDataTypes, setColumnDataTypes] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [message, setMessage] = useState(null);
    const [tableName, setTableName] = useState('');
    
    const [ontologyClass, setOntologyClass] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [propertyValue, setPropertyValue] = useState("");

    const [uris, setUris] = useState([]);
    const handleCreateTable = async () => {
      try {
        if (!tableName.trim()) {
          throw new Error('Table name cannot be empty');
        }
        await createTable(tableName);
        alert('Entity created successfully.');
        window.location.reload();
      } catch (error) {
        setMessage('Error creating table. See console for details.');
        console.error('Error creating table:', error);
      }
    };
    //bring tables
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
    //bring columns
    useEffect(() => {
        async function fetchData() {
          try {
            if (selectedTable) {
              const columnResponse = await axios.get(`http://localhost:5000/get-columns/${selectedTable}`);
              const columns = columnResponse.data.columns;
              setTableColumns(columns);
    
              // Fetch URIs for the columns
              const uriResponse = await axios.post('http://localhost:5000/read-uriontologies-data', { tableName: selectedTable });
              const { data } = uriResponse.data;
              const uriArray = data.map(item => item.ontologyProperty) || [];
              setUris(uriArray);

            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        }
    
        fetchData();
      }, [selectedTable]);
    //bring data types
    useEffect(() => {
        async function fetchDataTypes() {
            try {
                const response = await fetch('http://localhost:5000/inputs-of-datatypes');
                const vocresponse = await fetch ('http://localhost:5000/get-vtables');
                if (!response.ok) {
                    throw new Error('Failed to fetch data types');
                }
                if (!vocresponse.ok){
                    throw new Error('Failed to fetch vocabulary tables');
                }
                const data = await response.json();
                const vocabulary = await vocresponse.json();
                const voctableNames = vocabulary.tables;
                const combinedData = [...data, ...voctableNames];
                setColumnDataTypes(combinedData);
            } catch (error) {
                console.error('Error fetching data types:', error);
            }
        }

        fetchDataTypes();
    }, []);

    const handleAddColumn = async (columnName, columnType, uriName) => {
        try {
            const data2 = {
                    tableName: selectedTable,
                    columnName: columnName,
                    columnType: columnType,
                    ontologyProperty: uriName
            };
            axios.post('http://localhost:5000/add-column', data2)
            .catch(error => {
                console.error('Error saving ontology properties:', error);
            });

            const updatedColumns = [...tableColumns, { name: columnName, dataType: columnType }];
            setTableColumns(updatedColumns);

            togglePopup();
        } catch (error) {
            console.error('Error adding column:', error);
        }
    };

    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    const handleDelete = async () => {
        try {
            await deleteTable(selectedTable);
            console.log('Table deleted successfully');
            alert('Entity deleted successfully.');
            window.location.reload(); // Refresh the page after deletion
        } catch (error) {
            console.error('Error deleting table:', error);
        }
    };

    const handleDeleteColumn = async (columnName) => {
        try {
            await deleteColumn(selectedTable, columnName);
            console.log('Column deleted successfully');
            const updatedColumns = tableColumns.filter(column => column.name !== columnName);
            setTableColumns(updatedColumns);
        } catch (error) {
            console.error('Error deleting column:', error);
        }
    };
    const handleTableSelect = event => {
        const selectedTableName = event.target.value;
    
        setSelectedTable(selectedTableName); // Set the selected table
    
        axios.post(`http://localhost:5000/read-ontologies-data/`, { tableName: selectedTableName }) // Pass the selectedTableName as the body of the POST request
          .then(response => {
            // Assuming the response contains data in the expected format
            const { data } = response.data;
            if (data.length > 0) {
              const { Ontology_Class, Property_Name, Property_Value } = data[0];
              setOntologyClass(Ontology_Class || '');
              setPropertyName(Property_Name || '');
              setPropertyValue(Property_Value || '');
            } else {
              // Handle case when no data is returned
              console.log('No ontology data found for the selected table.');
              setOntologyClass('');
              setPropertyName('');
              setPropertyValue('');
            }
          })
          .catch(error => {
            console.error('Error fetching ontology data:', error);
          });
    };

    const handleInsertionOfOntology = () => {
        const ontologyClass = document.getElementById('ontologyClass').value;
        const propertyName = document.getElementById('propertyName').value;
        const propertyValue = document.getElementById('propertyValue').value;
    
        const data = {
            selectedTable: selectedTable || null,
            ontologyClass: ontologyClass || null,
            propertyName: propertyName || null,
            propertyValue: propertyValue || null
        };
        axios.post('http://localhost:5000/save-ontology-properties', data)
            .catch(error => {
                console.error('Error saving ontology properties:', error);
            });
    };
    const handleInsertionOfURI = (index, columnName) => {
        return () => {
            const uriInputElement = document.getElementById(`uriInput-${index}`);
            if (uriInputElement) {
                const tableN = selectedTable;
    
                const requestBody = {
                    tableN: tableN || null,
                    columnN: columnName || null,
                    ontologyProperty: uriInputElement.value || null
                };
    
                axios.post('http://localhost:5000/update-uri', requestBody)
                .catch(error => {
                    console.error('Error saving ontology properties:', error);
                });
            } else {
                console.error(`Element with ID 'uriInput-${index}' not found`);
            }
        };
    };
    
    
      
    

    return (
        <div style={{ marginBottom: '20px', paddingTop: "50px", paddingLeft: "10px", gap: '10px' }}>
            <h1>Configuration Page - Entity Categories</h1>
            <div>
                <input
                style={{marginBottom: '10px', backgroundColor: 'lightgrey'}}
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Enter new entity 's name"
                />
            <div>
            </div>
        <button  className='create-new'
        onClick={handleCreateTable}>Create Entity</button>
        </div>
        <h3>Current List:</h3>
            <div>
            <select value={selectedTable} onChange={handleTableSelect}>
                <option value="">Select a table</option>
                {tables.map((table, index) => (
                <option key={index} value={table}>{table}</option>
                ))}
            </select>
            {selectedTable !== "" && (
                <div>
                <table>
                    <tbody>
                    <tr>
                        <th><label htmlFor="ontologyClass">Ontology_Class:</label></th>
                        <td><input id="ontologyClass" type="text" value={ontologyClass} onChange={(e) => setOntologyClass(e.target.value)} placeholder="Type Optionally" /></td>
                    </tr>
                    <tr>
                        <th><label htmlFor="propertyName">Property_Name:</label></th>
                        <td><input id="propertyName" type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} placeholder="Type Optionally" /></td>
                    </tr>
                    <tr>
                        <th><label htmlFor="propertyValue">Property_Value:</label></th>
                        <td><input id="propertyValue" type="text" value={propertyValue} onChange={(e) => setPropertyValue(e.target.value)} placeholder="Type Optionally" /></td>
                    </tr>
                    </tbody>
                </table>
                <button
                    onClick={handleInsertionOfOntology}
                    className='create-new'
                    style={{ marginTop: '10px' }}
                >Save Ontology Properties</button>
                </div>
            )}
                <div style={{ textDecoration: 'underline', margin: '10px'}}
                                    >Documentation fields:</div>
                {tableColumns.length > 0 && (
                    <div>
                        <ul>
                        
                            {tableColumns.map((column, index) => (
                                <div style={{ marginBottom: '10px' }} key={column.name}>
                                    
                                    {(index === 0) && (
                                         <div className="row-container" key={column.name}>
                                            <div>{column.name}:</div>
                                            <input
                                                className="column-container"
                                                type="text"
                                                value={'Unique ID autoassigned'}
                                                disabled
                                            />
                                        </div>
                                    )}
                                    {(index >= 1) && (
                                        <div className="row-container" key={column.name}>
                                           
                                           <div>{column.name}:</div>
                                            <input
                                                className="column-container"
                                                type="text"
                                                value={column.dataType}
                                                disabled
                                            />
                                             <input
                                                key={index}
                                                id={`uriInput-${index}`}
                                                value={uris[index-1] || ''}
                                                onChange={(e) => {
                                                    const { value } = e.target;
                                                    const updatedUris = uris.map((uri, idx) => {
                                                        if (idx === index) {
                                                            return value;
                                                        } else {
                                                            return uri;
                                                        }
                                                    });
                                                    setUris(updatedUris);
                                                }}
                                                type='text'
                                                placeholder='Optionally Write URI'
                                            />
                                            <button
                                            onClick={handleInsertionOfURI(index, column.name)}
                                            >Insert URI</button>
                                            <button
                                                className='c-del-but'
                                                onClick={() => handleDeleteColumn(column.name)}
                                            >delete row
                                            </button>
                                        </div>
                                        
                                    )}
                                </div>
                            ))}
                        </ul>
                        <button 
                            onClick={togglePopup}
                            className='set-ontology-property'
                            style={{paddingBottom: '20px'}}
                        >add new documentation field</button>
                        {isPopupOpen && <Popup columnDataTypes={columnDataTypes} onSubmit={handleAddColumn} onClose={togglePopup} />}
                    </div>
                )}
                
                <div>
                    <button className='submitDelete' onClick={handleDelete}>DELETE ENTITY</button>
                </div>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
}

export default EntityCategories;
