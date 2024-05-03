import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DocStyles.css';

function CreateNewEntity2() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableColumns, setTableColumns] = useState([]);
    const [connectionvoc, setConnectionvoc] = useState([]);
    const [selectOptions, setSelectOptions] = useState({}); 
    const [selectEntity, setSelectEntity] = useState({});

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
            const formData = { tableName: selectedTable, columns: [], values: [] };
    
            // Iterate through connectionvoc to find columns with vocS=0
            for (let column of connectionvoc) {
                if (column.vocS === 0) {
                    // Get the input value using the column name
                    const inputValue = document.getElementById(`${column.tableC}-input`).value;
                    
                    // Add column name and value to formData
                    formData.columns.push(column.tableC);
                    formData.values.push(inputValue);
                }
            }
    
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
    const bringVocInputs = async (vocName, columnIdx) => { 
        try {
            const data = { tableName: vocName };
            const response = await axios.post('http://localhost:5000/read-vdata', data);
            console.log('Vocabulary Insertions brought successfully');
            setSelectOptions(prevOptions => ({
                ...prevOptions,
                [columnIdx]: response.data.data // Storing options for the specific dropdown
            }));
        } catch (error) {
            console.error('Error bringing vocabulary insertions', error);
        }
    };
    const bringEntityInsertions = async (tableName, columnIdx) => {
        try {
            const response = await axios.get(`http://localhost:5000/get-data/${tableName}`);
            console.log('Entity Insertions fetched successfully');
    
            // Assuming response.data is an array of entity insertions
            setSelectEntity(prevEntity => ({
                ...prevEntity,
                [columnIdx]: response.data
            }));
        } catch (error) {
            console.error('Error fetching Entity insertions', error);
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
            <div style={{marginTop: '50px'}}>
                <label><b>ID:</b></label>
                <input 
                    className='inputID'
                    value="automatically assigned"
                    disabled />
            </div>
            
            <form onSubmit={handleSave}>
                {connectionvoc.length > 0 && (
                    <div>
                        {connectionvoc.map((column, index) => (
                            <div key={index}>
                                {column.vocS === 0 && (
                                    <div>
                                        <label><b>{column.tableC}:</b></label>
                                        <input id={`${column.tableC}-input`} type="text" />
                                    </div>
                                )}
                                {column.vocS === 1 && (
                                    <div>
                                        <label><b>{column.tableC}:</b></label>
                                        <select onClick={() => bringVocInputs(column.vocT, index)}> {/* Pass index to identify which dropdown is clicked */}
                                            <option value="">Select {column.tableC}</option>
                                            {selectOptions[index] && selectOptions[index].map((option, optionIndex) => (
                                                <option key={optionIndex} value={option.ID}>{option.name} {option.broader}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {column.vocS === 2 && (
                                    <div>
                                        <label><b>{column.tableC}:</b></label>
                                        <select onClick={() => bringEntityInsertions(column.vocT, index)}>
                                            <option value="">Select {column.tableC}</option>
                                            {Array.isArray(selectEntity[index]?.data) && selectEntity[index].data.map((option, optionIndex) => {
                                                // Exclude the "ID" column from the displayed options
                                                const { ID, ...otherColumns } = option;
                                                const optionText = Object.values(otherColumns).join(' | ');
                                                return <option key={optionIndex} value={option.ID}>{optionText}</option>;
                                            })}
                                        </select>
                                    </div>
                                )}


                            </div>
                        ))}
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
