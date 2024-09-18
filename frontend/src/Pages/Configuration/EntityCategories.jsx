import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Popup from './AddColumn.jsx';
import './Styles.css';
import { deleteColumn, deleteTable, createTable } from '../../databaseUtils.js';
import Toast from '../../Toast.jsx';

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
    const [connectionVoc, setConnectionVoc] = useState([]);
    const [uris, setUris] = useState([]);

    useEffect(() => {
        fetchTables();
    }, []);

    useEffect(() => {
        if (selectedTable) {
            fetchData();
            fetchConnection();
            fetchDataTypes();
        }
    }, [selectedTable]);

    const fetchTables = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get-tables');
            setTables(response.data.tables);
        } catch (error) {
            setMessage('Error fetching tables.');
            console.error('Error fetching tables:', error);
        }
    };

    const fetchData = async () => {
        try {
            const columnResponse = await axios.get(`http://localhost:5000/get-columns/${selectedTable}`);
            setTableColumns(columnResponse.data.columns);

            const uriResponse = await axios.post('http://localhost:5000/read-uriontologies-data', { tableName: selectedTable });
            const { data } = uriResponse.data;
            setUris(data.map(item => item.ontologyProperty) || []);
        } catch (error) {
            setMessage('Error fetching data.');
            console.error('Error fetching data:', error);
        }
    };

    const fetchConnection = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/get-connectionvoc/${selectedTable}`);
            setConnectionVoc(response.data || []);
        } catch (error) {
            setMessage('Error fetching connection data.');
            console.error('Error fetching connection data:', error);
        }
    };

    const fetchDataTypes = async () => {
        try {
            const [tResponse, dResponse, vResponse] = await Promise.all([
                axios.get('http://localhost:5000/get-tables'),
                axios.get('http://localhost:5000/inputs-of-datatypes'),
                axios.get('http://localhost:5000/get-vtables')
            ]);

            const tableNames = tResponse.data.tables.filter(tableName => tableName !== selectedTable);
            const vocTableNamesWithVoc = vResponse.data.tables.map(tableName => tableName + ' Vocab');
            setColumnDataTypes([...tableNames, ...dResponse.data, ...vocTableNamesWithVoc]);
        } catch (error) {
            setMessage('Error fetching data types.');
            console.error('Error fetching data types:', error);
        }
    };

    const handleCreateTable = async () => {
        try {
            if (!tableName.trim()) {
                throw new Error('Table name cannot be empty');
            }
            await createTable(tableName);

            const response = await axios.get('http://localhost:5000/get-tables');
            setTables(response.data.tables);
            setTableName('');
            setMessage(`${tableName} created successfully.`);
        } catch (error) {
            setMessage(`Entity's name cannot be empty.`);
            console.error('Error creating table:', error);
        }
    };

    const handleAddColumn = async (columnName, columnType, uriName) => {
        try {
            if (uriName.includes(' ')){
                setMessage('Error: No spaces allowed in URI.');
                return;
            }
            const data = {
                tableName: selectedTable,
                columnName,
                columnType,
                ontologyProperty: uriName
            };
            await axios.post('http://localhost:5000/add-column', data);

            setMessage(`${data.columnName} added successfully.`)
            fetchData();
            togglePopup();
        } catch (error) {
            setMessage('Error adding column.');
            console.error('Error adding column:', error);
        }
    };

    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    const handleDelete = async () => {
        try {
            if (selectedTable === ''){
                setMessage('You need to select an Entity first.');
                return;
            }
            await deleteTable(selectedTable);
            setMessage(`${selectedTable} deleted successfully.`);
            fetchTables();
        } catch (error) {
            setMessage('Error deleting table.');
            console.error('Error deleting table:', error);
        }
    };

    const handleDeleteColumn = async (columnName) => {
        try {
            await deleteColumn(selectedTable, columnName);
            setMessage(`${columnName} deleted successfully.`)
            fetchData();
        } catch (error) {
            setMessage('Error deleting column.');
            console.error('Error deleting column:', error);
        }
    };

    const handleTableSelect = (event) => {
        const selectedTableName = event.target.value;
        setSelectedTable(selectedTableName);
        setTableColumns([]); // Clear columns when a new table is selected

        axios.post(`http://localhost:5000/read-ontologies-data/`, { tableName: selectedTableName })
            .then(response => {
                const { data } = response.data;
                if (data.length > 0) {
                    const { Ontology_Class, Property_Name, Property_Value } = data[0];
                    setOntologyClass(Ontology_Class || '');
                    setPropertyName(Property_Name || '');
                    setPropertyValue(Property_Value || '');
                } else {
                    setOntologyClass('');
                    setPropertyName('');
                    setPropertyValue('');
                }
            })
            .catch(error => {
                setMessage('Error fetching ontology data.');
                console.error('Error fetching ontology data:', error);
            });
    };

    const handleInsertionOfOntology = () => {
        if (ontologyClass.includes(' ') || propertyName.includes(' ') || propertyValue.includes(' ')) {
            setMessage('Error: No spaces allowed in ontology class, property name, or property value.');
            return;
        }
    
        const data = {
            selectedTable,
            ontologyClass,
            propertyName,
            propertyValue
        };

        axios.post('http://localhost:5000/save-ontology-properties', data)
            .then(() => {
                setMessage('Ontology properties saved successfully.');
            })
            .catch(error => {
                setMessage('Error saving ontology properties.');
                console.error('Error saving ontology properties:', error);
            });
    };

    const handleInsertionOfURI = (index, columnName) => {
        
        const uriInputValue = uris[index - 1];
        if (uriInputValue.includes(' ')) {
            setMessage('Error: No spaces allowed in URI.');
            return;
        }
        const requestBody = {
            tableN: selectedTable,
            columnN: columnName,
            ontologyProperty: uriInputValue
        };

        axios.post('http://localhost:5000/update-uri', requestBody)
            .then(setMessage('URI updated successfully.'))
            .catch(error => {
                setMessage('Error saving ontology properties.');
                console.error('Error saving ontology properties:', error);
            });
    };

    const determineValue = (columnName) => {
        const column = connectionVoc.find(col => col.tableC === columnName);
        if (column) {
            if (column.vocS === 1)
                return 'Vocabulary';
            else if (column.vocS === 2)
                return 'Entity';
            else if (column.vocS === 0 && column.vocT === "VARCHAR(255)")
                return 'text';
            else
                return column.vocT;
        } else {
            fetchConnection();
            const newColumn = tableColumns.find(col => col.name === columnName);
            return (newColumn.dataType === 'VARCHAR(255)' ? 'TEXT' : newColumn.dataType);
        }
    };

    return (
        <div style={{ marginBottom: '20px', paddingTop: "50px", paddingLeft: "10px", gap: '10px' }}>
            <h1>Configuration Page - Entity Categories</h1>
            <div>
                <input
                    style={{ marginBottom: '10px' }}
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Enter new entity's name"
                />
                <button className='create-new' onClick={handleCreateTable}>Create Entity</button>
            </div>
            <h3>Current List:</h3>
            <div>
                <select value={selectedTable} onChange={handleTableSelect}>
                    <option value="">Select Entity</option>
                    {tables.map((table, index) => (
                        <option key={index} value={table}>{table}</option>
                    ))}
                </select>
                {selectedTable && (
                    <div>
                        <table>
                            <tbody>
                                <tr>
                                    <th><label htmlFor="ontologyClass">Ontology_Class:</label></th>
                                    <td><input id="ontologyClass" type="text" value={ontologyClass} 
                                    style={{ width: '300px' }}
                                    onChange={(e) => setOntologyClass(e.target.value)} placeholder="Type Optionally" /></td>
                                </tr>
                                <tr>
                                    <th><label htmlFor="propertyName">Property_Name:</label></th>
                                    <td><input id="propertyName" type="text" value={propertyName} 
                                    style={{ width: '300px' }}
                                    onChange={(e) => setPropertyName(e.target.value)} placeholder="Type Optionally" /></td>
                                </tr>
                                <tr>
                                    <th><label htmlFor="propertyValue">Property_Value:</label></th>
                                    <td><input id="propertyValue" type="text" value={propertyValue} 
                                    style={{ width: '300px' }}
                                    onChange={(e) => setPropertyValue(e.target.value)} placeholder="Type Optionally" /></td>
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
                <div style={{ textDecoration: 'underline', margin: '10px' }}>Documentation fields:</div>
                {selectedTable && tableColumns.length > 0 && (
                    <div>
                        <table>
                            <tbody>
                                {tableColumns.map((column, index) => (
                                    <div style={{ marginBottom: '10px' }} key={column.name}>
                                        {index === 0 && (
                                            <div className="row-container">
                                                <label style={{ marginLeft: '50px' }}><b>ID:</b></label>
                                                <input
                                                    className="column-container"
                                                    type="text"
                                                    value="Unique ID autoassigned"
                                                    disabled
                                                />
                                            </div>
                                        )}
                                        {index >= 1 && (
                                            <div className="row-container">
                                                <tr>
                                                    <label><b>{column.name}:</b></label>
                                                    <td>
                                                        <input
                                                            className="column-container"
                                                            type="text"
                                                            value={determineValue(column.name)}
                                                            disabled
                                                            style={{ width: '100px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            id={`uriInput-${index}`}
                                                            value={uris[index - 1] || ''}
                                                            onChange={(e) => {
                                                                const updatedUris = [...uris];
                                                                updatedUris[index - 1] = e.target.value;
                                                                setUris(updatedUris);
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
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </tbody>
                        </table>
                        <button
                            onClick={togglePopup}
                            className='set-ontology-property'
                            style={{ paddingBottom: '20px' }}
                        >add new documentation field</button>
                        {isPopupOpen && <Popup columnDataTypes={columnDataTypes} onSubmit={handleAddColumn} onClose={togglePopup} />}
                    </div>
                )}
                <div>
                    <button className='submitDelete' onClick={handleDelete}>DELETE ENTITY</button>
                </div>
            </div>
            {message && <Toast text={message} onClose={() => setMessage(null)} />}
        </div>
    );
}

export default EntityCategories;
