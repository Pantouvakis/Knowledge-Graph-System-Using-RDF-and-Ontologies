import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Styles.css';
import { deleteColumn, deleteTable } from '../../databaseUtils.js';

function EntityCategories() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableColumns, setTableColumns] = useState([]);
    const [showInput, setShowInput] = useState(false);
    const [columnName, setColumnName] = useState('');
    const [dataType, setDataType] = useState(''); // Initial value can be changed

    const handleButtonClick = () => {
        setShowInput(true);
    };

    const handleInputChange = (e) => {
        setColumnName(e.target.value);
    };

    const handleDataTypeChange = (e) => {
        setDataType(e.target.value);
    };

    const handleInsertColumn = () => {
        // You can perform any logic here, like sending the column name and data type to the server
        // For simplicity, let's just log them for now
        console.log('Column Name:', columnName);
        console.log('Data Type:', dataType);
        // After inserting the column, you can reset the input fields and hide them
        setColumnName('');
        setDataType('');
        setShowInput(false);
    };
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

    const handleDelete = async () => {
        try {
            await deleteTable(selectedTable);
            console.log('Table deleted successfully');
            alert('Entity deleted successfully.')
            window.location.reload();
        } catch (error) {
            console.error('Error deleting table:', error);
        }
    };

    const handleTableSelect = (event) => {
        setSelectedTable(event.target.value);
    };

    const handleDeleteColumn = (columnName) => {
        try {
            deleteColumn(selectedTable, columnName);
            console.log('Column deleted successfully');
            const updatedColumns = tableColumns.filter(column => column.name !== columnName);
            setTableColumns(updatedColumns.length > 0 ? updatedColumns : null);
        } catch (error) {
            console.error('Error deleting column:', error);
        }
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
                        <div style={{ marginBottom: '10px' }} key={index}>
                            {(index < 4) && (
                                <div className="row-container" key={index}>
                                    <div>{column.name}:</div>
                                    <input
                                        className="column-container"
                                        type="text"
                                        value={column.value}
                                        disabled={index === 0}
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
                                <div className="row-container" key={index}>
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
                        <button className='set-ontology-property'
                        >add new documentation field</button>
                    </div>
                )}
                
                <div>
                    <button className='submitSave'>SAVE</button>
                    <button className='submitDelete'
                    onClick={handleDelete}>DELETE TABLE</button>
                </div>
            </div>
        </div>
    );
}

export default EntityCategories;
