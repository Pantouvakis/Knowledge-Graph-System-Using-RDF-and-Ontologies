import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DocStyles.css';


function CreateNewEntity2() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableColumns, setTableColumns] = useState([]);
    const [connectionvoc, setConnectionvoc] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const tablesResponse = axios.get('http://localhost:5000/get-tables');
                const tableColumnsResponse = selectedTable
                    ? axios.get(`http://localhost:5000/get-columns/${selectedTable}`)
                    : Promise.resolve({ data: { columns: [] } }); // Return empty columns if no table is selected
                const connectionvocResponse = selectedTable
                    ? axios.get(`http://localhost:5000/get-connectionvoc/${selectedTable}`)
                    : Promise.resolve({ data: [] }); // Return empty array if no table is selected
                
                const [tablesRes, columnsRes, connectionvocRes] = await Promise.all([tablesResponse, tableColumnsResponse, connectionvocResponse]);

                setTables(tablesRes.data.tables);
                setTableColumns(columnsRes.data.columns);
                setConnectionvoc(connectionvocRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } 
        fetchData();
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
    const handleSave = async (event) => {
    event.preventDefault();

    try {
        const filteredColumns = tableColumns.filter(column => column.name !== 'ID');
        const formData = {
            tableName: selectedTable,
            columns: filteredColumns.map(column => column.name),
            values: filteredColumns.map(column => column.value || '')
        };
        const response = await axios.post('http://localhost:5000/insert-data', formData);

        console.log('Data inserted successfully');
        setTableColumns(prevColumns => prevColumns.map(column => ({ ...column, value: '' })));

        alert('Your data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error);
    }
    };
    const handleIntegerChange = (e, index) => {
        const { value } = e.target;
        const newValue = value === '' ? 0 : value;
        updateColumnValue(index, newValue);
    };
    const updateColumnValue = (index, value) => {
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
            <form onSubmit={handleSave}>
                {tableColumns.length > 0 && (
                    <div>
                        <div style={{paddingTop: '50px'}}>
                            {tableColumns.map((column, index) => {
                                if (column.name === 'ID') {
                                return (
                                    <div>
                                        <div 
                                            key={index}>
                                            {column.name}:
                                            <input 
                                                className='inputID'
                                                value="automatically assigned"
                                                disabled />
                                        </div>
                                        <div 
                                        style={{ textDecoration: 'underline', marginTop: '20px', marginBottom: '20px' }}>
                                        Documentation fields:</div>
                                    </div>
                                    
                                );
                                }
                                else{
                                    return (
                                        <div style={{marginLeft:'50px'}} key={index}>
                                            {column.name}[{column.dataType}]:
                                            {column.foreignKey ? (
                                                <select
                                                    value={column.value}
                                                    onChange={(e) => handleIntegerChange(e, index)}
                                                    >
                                                    <option value="">Select {column.foreignKey}</option>
                                                </select>
                                            ) : column.dataType === 'int' ? (
                                                <input 
                                                    className='inputs'
                                                    placeholder='Type your number here'
                                                    type="number"
                                                    value={column.value}
                                                    onChange={(e) => handleIntegerChange(e, index)} />
                                            ) : column.dataType === 'date' ? (
                                                <input
                                                    className='inputs'
                                                    placeholder='YYYY-MM-DD'
                                                    type="text"
                                                    value={column.value}
                                                    onChange={(e) => handleInputChange(e, index)} />
                                            ) : column.dataType === 'year' ? (
                                                <input
                                                    className='inputs'
                                                    placeholder='YYYY'
                                                    type="number"
                                                    value={column.value}
                                                    onChange={(e) => handleInputChange(e, index)} />
                                            ) : column.dataType === 'varchar' ? (
                                                <input
                                                    className='inputs'
                                                    placeholder="Type here"
                                                    type="text"
                                                    value={column.value || ''}
                                                    onChange={(e) => handleInputChange(e, index)} />
                                            ) : column.dataType === 'text' ? (
                                                <textarea
                                                    className='inputs'
                                                    placeholder='Type here'
                                                    value={column.value || ''}
                                                    onChange={(e) => handleInputChange(e, index)} />
                                            ) : column.dataType === 'decimal' ? (
                                                <input
                                                    className='inputs'
                                                    type="number"
                                                    step="any"
                                                    value={column.value || ''}
                                                    onChange={(e) => handleInputChange(e, index)} />
                                            ) :column.dataType === 'time' ? (
                                                <input
                                                    className='inputs'
                                                    type="text"
                                                    placeholder="HH:MM:SS"
                                                    value={column.value || ''}
                                                    onChange={(e) => handleInputChange(e, index)} />
                                            ) : column.dataType === 'datetime' ? (
                                                <input
                                                    className='inputs'
                                                    type="text"
                                                    placeholder="YYYY-MM-DD HH:MM:SS"
                                                    value={column.value || ''}
                                                    onChange={(e) => handleInputChange(e, index)} />
                                            ) : (
                                                
                                                <input
                                                    className='inputs'
                                                    type="text"
                                                    value={column.value || ''}
                                                    onChange={(e) => handleInputChange(e, index)} />
                                            )}

                                        </div>
                                    );
                                }
                            })}
                            </div>
                           

                    </div>
                )}
                <div>
                    <button type="submit" className='submitSave'>SAVE</button>
                </div>
            </form>
        </div>
    );
}
export default CreateNewEntity2;