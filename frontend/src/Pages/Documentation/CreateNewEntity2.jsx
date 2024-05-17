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
                const tablesResponse = await axios.get('http://localhost:5000/get-tables');
                setTables(tablesResponse.data.tables);

                if (selectedTable) {
                    const tableColumnsResponse = await axios.get(`http://localhost:5000/get-columns/${selectedTable}`);
                    setTableColumns(tableColumnsResponse.data.columns);

                    const connectionvocResponse = await axios.get(`http://localhost:5000/get-connectionvoc/${selectedTable}`);
                    setConnectionvoc(connectionvocResponse.data);

                    const optionsPromises = connectionvocResponse.data.map(column => {
                        if (column.vocS === 1) {
                            return bringVocInputs(column.vocT);
                        } else if (column.vocS === 2) {
                            return bringEntityInsertions(column.vocT);
                        }
                        return Promise.resolve();
                    });
                    await Promise.all(optionsPromises);
                }
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
        
            for (let column of connectionvoc) {
                if (column.vocS === 0) {
                    const inputValue = document.getElementById(`${column.tableC}-input`).value;
        
                    formData.columns.push(column.tableC);
                    formData.values.push(inputValue);
                } else if (column.vocS === 1 || column.vocS === 2) {
                        const selectedValue = selectEntity[column.tableC]?.data || '';
                        formData.columns.push(column.tableC);
                        formData.values.push(selectedValue);
                    }
                }
            
                const response = await axios.post('http://localhost:5000/insert-data', formData);
            
                console.log('Data inserted successfully');
            
                // Clear inputs and dropdowns after insertion
                setTableColumns(prevColumns => prevColumns.map(column => ({ ...column, value: '' })));
                setSelectOptions({});
                setSelectEntity({});
                setSelectedTable('');
                setConnectionvoc([]);
            
                alert('Your data saved successfully');
            } catch (error) {
                console.error('Error saving data:', error);
            }
        };
    
        const handleSelectChange = (event, column) => {
            const selectedValue = Array.from(event.target.selectedOptions, option => option.value);
            setSelectEntity(prevEntity => ({
                ...prevEntity,
                [column.tableC]: { data: selectedValue }
            }));
        };
    
        const bringVocInputs = async (vocName) => {
            try {
                const data = { tableName: vocName };
                const response = await axios.post('http://localhost:5000/read-vdata', data);
                setSelectOptions(prevOptions => ({
                    ...prevOptions,
                    [vocName]: response.data.data // Storing options for the specific dropdown
                }));
            } catch (error) {
                console.error('Error bringing vocabulary insertions', error);
            }
        };
    
        const bringEntityInsertions = async (tableName) => {
            try {
                const response = await axios.get(`http://localhost:5000/get-data/${tableName}`);
                setSelectEntity(prevEntity => ({
                    ...prevEntity,
                    [tableName]: response.data
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
                                            <select onChange={(event) => handleSelectChange(event, column)}>
                                                <option value="">Select {column.tableC}</option>
                                                {selectOptions[column.vocT] && selectOptions[column.vocT].map((option, optionIndex) => (
                                                    <option key={optionIndex} value={option.ID}>{option.name} {option.broader}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {column.vocS === 2 && (
                                        <div>
                                            <label><b>{column.tableC}:</b></label>
                                            <select onChange={(event) => handleSelectChange(event, column)}>
                                                <option value="">Select {column.tableC}</option>
                                                {Array.isArray(selectEntity[column.vocT]?.data) && selectEntity[column.vocT].data.map((option, optionIndex) => {
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
    