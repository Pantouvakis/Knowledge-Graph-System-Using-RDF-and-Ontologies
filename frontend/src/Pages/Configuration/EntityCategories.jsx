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
    
        async function fetchData() {
            try {
                if (selectedTable) {
                    const columnResponse = await axios.get(`http://localhost:5000/get-columns/${selectedTable}`);
                    const columns = columnResponse.data.columns;
                    setTableColumns(columns);
    
                    const uriResponse = await axios.post('http://localhost:5000/read-uriontologies-data', { tableName: selectedTable });
                    const { data } = uriResponse.data;
                    const uriArray = data.map(item => item.ontologyProperty) || [];
                    setUris(uriArray);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    
        async function fetchDataTypes() {
            try {
                // Fetch table names, data types, and vocabulary tables
                const [tresponse, response, vocresponse] = await Promise.all([
                    fetch('http://localhost:5000/get-tables'),
                    fetch('http://localhost:5000/inputs-of-datatypes'),
                    fetch('http://localhost:5000/get-vtables')
                ]);
        
                if (!tresponse.ok || !response.ok || !vocresponse.ok) {
                    throw new Error('Failed to fetch data');
                }
        
                // Parse response data
                const tdata = await tresponse.json();
                const data = await response.json();
                const vocabulary = await vocresponse.json();
                const voctableNames = vocabulary.tables;
        
                const tableNames = tdata.tables.filter(tableName => tableName !== selectedTable);
                const vocTableNamesWithVoc = voctableNames.map(tableName => tableName + ' Vocab');

                //dropdown
                const combinedData = [...tableNames, ...data, ...vocTableNamesWithVoc];
        
                // Set state or perform further processing
                setColumnDataTypes(combinedData);
            } catch (error) {
                console.error('Error fetching data types:', error);
            }
        }
        
    
        fetchTables();
        fetchData();
        fetchDataTypes();
    }, [selectedTable]);
    const handleCreateTable = async () => {
        try {
            if (!tableName.trim()) {
                throw new Error('Table name cannot be empty');
            }
            await createTable(tableName);
            alert('Entity created successfully.');
    
            // Fetch tables again after creating the new table
            const response = await axios.get('http://localhost:5000/get-tables');
            const tableNames = response.data.tables;
            setTables(tableNames);
    
            setTableName('');
    
            setMessage('Entity created successfully.');
        } catch (error) {
            setMessage('Error creating table. See console for details.');
            console.error('Error creating table:', error);
        }
    };
    const handleAddColumn = async (columnName, columnType, uriName) => {
        try {
            const data2 = {
                tableName: selectedTable,
                columnName: columnName,
                columnType: columnType,
                ontologyProperty: uriName
            };
            await axios.post('http://localhost:5000/add-column', data2);
    
            // Fetch the updated columns after adding a new column
            const columnResponse = await axios.get(`http://localhost:5000/get-columns/${selectedTable}`);
            const columns = columnResponse.data.columns;
            setTableColumns(columns);
    
            // Fetch URIs for the columns again
            const uriResponse = await axios.post('http://localhost:5000/read-uriontologies-data', { tableName: selectedTable });
            const { data } = uriResponse.data;
            const uriArray = data.map(item => item.ontologyProperty) || [];
            setUris(uriArray);
    
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

            const response = await axios.get('http://localhost:5000/get-tables');
            const tableNames = response.data.tables;
            setTables(tableNames);
        } catch (error) {
            console.error('Error deleting table:', error);
        }
    };
    const handleDeleteColumn = async (columnName) => {
        try {
            await deleteColumn(selectedTable, columnName);
            console.log('Column deleted successfully');
    
            // Fetch updated columns after deleting a column
            const columnResponse = await axios.get(`http://localhost:5000/get-columns/${selectedTable}`);
            const columns = columnResponse.data.columns;
            setTableColumns(columns);
    
            // Fetch URIs for the columns again
            const uriResponse = await axios.post('http://localhost:5000/read-uriontologies-data', { tableName: selectedTable });
            const { data } = uriResponse.data;
            const uriArray = data.map(item => item.ontologyProperty) || [];
            setUris(uriArray);
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
                        <div>
                        
                            {tableColumns.map((column, index) => (
                                <div style={{ marginBottom: '10px' }} key={column.name}>
                                    
                                    {(index === 0) && (
                                         <div className="row-container" key={column.name}>
                                            <lable><b>ID:</b></lable>
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
                                        <tbody>
                                            <tr>
                                                <th>{column.name}:</th>
                                                <td>
                                                    <input
                                                        className="column-container"
                                                        type="text"
                                                        value={column.dataType}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        key={index}
                                                        id={`uriInput-${index}`}
                                                        value={uris[index-1] || ''}
                                                        onChange={(e) => {
                                                            const { value } = e.target;
                                                            const updatedUris = [...uris]; // Create a copy of the uris array
                                                            updatedUris[index-1] = value; // Update the URI at the corresponding index
                                                            setUris(updatedUris); // Update the uris state
                                                        }}
                                                        type='text'
                                                        placeholder='Optionally Write URI'
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleInsertionOfURI(index, column.name)}
                                                    >Update URI</button>
                                                </td>
                                                <td>
                                                    <button
                                                        className='c-del-but'
                                                        onClick={() => handleDeleteColumn(column.name)}
                                                    >delete row
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </div>
                                    
                                    
                                        
                                    )}
                                </div>
                            ))}
                        </div>
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
