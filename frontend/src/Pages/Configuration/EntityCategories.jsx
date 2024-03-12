import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Popup from './AddColumn.jsx'; // Import the Popup component
import './Styles.css';
import { deleteColumn, deleteTable } from '../../databaseUtils.js';

function EntityCategories() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableColumns, setTableColumns] = useState([]);
    const [columnDataTypes, setColumnDataTypes] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

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
        async function fetchTableColumns() {
            try {
                if (selectedTable) {
                    const response = await axios.get(`http://localhost:5000/get-columns/${selectedTable}`);
                    const columns = response.data.columns;
                    setTableColumns(columns);
                }
            } catch (error) {
                console.error('Error fetching columns:', error);
            }
        }

        fetchTableColumns();
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

    const handleAddColumn = async (columnName, columnType) => {
        try {
            if (!selectedTable){
                throw new Error('No Entity Selected');
            }
           
            const response = await fetch('http://localhost:5000/add-column', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tableName: selectedTable,
                    columnName: columnName,
                    columnType: columnType
                })
            });
            if (!response.ok) {
                throw new Error('Failed to add column');
            }
            const responseData = await response.json();
            console.log(responseData);
            // Update table columns after adding the new column
            const updatedColumns = [...tableColumns, { name: columnName, dataType: columnType }];
            setTableColumns(updatedColumns);
            togglePopup(); // Close the popup after successful submission
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
        setSelectedTable(event.target.value);
    };

    return (
        <div style={{ marginBottom: '20px', paddingTop: "50px", paddingLeft: "10px", gap: '10px' }}>
            <h1>Configuration Page - Entity Categories</h1>
            <h3>Current List:</h3>
            <div>
                <select value={selectedTable} onChange={handleTableSelect}>
                    <option value="">Select a table</option>
                    {tables.map((table, index) => (
                        <option key={index} value={table}>{table}</option>
                    ))}
                </select>
                {tableColumns.length > 0 && (
                    <div>
                        <ul>
                            {tableColumns.map((column, index) => (
                                <div style={{ marginBottom: '10px' }} key={column.name}>
                                    {(index < 4) && (
                                        <div className="row-container" key={column.name}>
                                            <div>{column.name}:</div>
                                            <input
                                                className="column-container"
                                                type="text"
                                                value={column.value}
                                                disabled={true}
                                                placeholder={
                                                    index === 0 ? "automatically assigned" :
                                                    index === 1 ? "Select Ontology" :
                                                    index === 2 ? "Optionally write name" :
                                                    index === 3 ? "Optionally write Value" :
                                                    ""
                                                }
                                            />
                                        </div>
                                    )}
                                    {(index === 3) && <div className='documentationField'>Documentation fields:</div>}
                                    {(index >= 4) && (
                                        <div className="row-container" key={column.name}>
                                            <div>{column.name}:</div>
                                            <input
                                                className="column-container"
                                                type="text"
                                                value={column.dataType}
                                                disabled
                                            />
                                            <button
                                                className='c-del-but'
                                                onClick={() => handleDeleteColumn(column.name)}
                                            >delete
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
                    <button className='submitSave'>SAVE</button>
                    <button className='submitDelete' onClick={handleDelete}>DELETE TABLE</button>
                </div>
            </div>
        </div>
    );
}

export default EntityCategories;
