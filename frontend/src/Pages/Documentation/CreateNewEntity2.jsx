import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DocStyles.css';

function CreateNewEntity2() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableColumns, setTableColumns] = useState([]);

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

    useEffect(() => {
        async function fetchTableColumns() {
            try {
                if (selectedTable) {
                    const response = await axios.get(`http://localhost:5000/get-columns/${selectedTable}`);
                    setTableColumns(response.data.columns);
                }
            } catch (error) {
                console.error('Error fetching columns:', error);
            }
        }

        fetchTableColumns();
    }, [selectedTable]);

    const handleInputChange = (event, index) => {
        const { value } = event.target;
        setTableColumns(prevColumns => {
            const updatedColumns = [...prevColumns];
            updatedColumns[index].value = value;
            return updatedColumns;
        });
    };


    const handleTableSelect = (event) => {
        setSelectedTable(event.target.value);
    };

    return (
        <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
            <h1>Documentation Page - Insert New Entity</h1>
            <div className="select-row">
                <div>Select Entity Category:</div>
                <select value={selectedTable} onChange={handleTableSelect}>
                    <option value="">Select Entity</option>
                    {tables.map((table, index) => (
                        <option key={index} value={table}>{table}</option>
                    ))}
                </select>
            </div>
            <form >
                {tableColumns.length > 0 && (
                    <div>
                        <div style={{paddingTop: '50px'}}>
                            {tableColumns.map((column, index) => {
                                if (column.name === 'ID') {
                                return (
                                    <div key={index}>
                                    {column.name}:
                                    <input className='inputID' 
                                    placeholder='automatically assigned'
                                    value={column.value || ''} o
                                    nChange={(e) => handleInputChange(e, index)} />
                                    </div>
                                );
                                }
                                return null;
                            })}
                            </div>
                            <div>
                                <div style={{ textDecoration: 'underline', marginTop: '20px' }}>
                                    Documentation fields:</div>
                            <ul className="inputs-container">
                                {tableColumns
                                .filter(column => column.name !== 'ID') // Filter out the ID column
                                .map((column, index) => (
                                    <li key={index}>
                                    {column.name} [{column.dataType}]:
                                    <input className='inputs' value={column.value || ''} onChange={(e) => handleInputChange(e, index)} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                )}
                <div>
                    <button type="button" className='submitSave'>SAVE</button>
                    <button type="button" className='submitDelete'>DELETE</button>
                </div>
            </form>
        </div>
    );
}
export default CreateNewEntity2;