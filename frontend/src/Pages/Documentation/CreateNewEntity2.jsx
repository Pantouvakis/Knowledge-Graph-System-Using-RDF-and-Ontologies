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

    const handleSave = async (event) => {
    event.preventDefault();

    try {
        const formData = {
            tableName: selectedTable,
            columns: tableColumns.map(column => column.name),
            values: tableColumns.map(column => column.value || '')
        };
        const response = await axios.post('http://localhost:5000/insert-data', formData);

        console.log('Data inserted successfully');
        window.location.reload();

        alert('Your data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error);
    }
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
                                            <input 
                                                className='inputs' 
                                                type="text"
                                                value={column.value || ''}
                                                onChange={(e) => handleInputChange(e, index)}/>
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