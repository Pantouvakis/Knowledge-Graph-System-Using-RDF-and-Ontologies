import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DocStyles.css';
import Toast from '../../Toast.jsx';

function CreateNewEntity2() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [connectionvoc, setConnectionvoc] = useState([]);
    const [selectOptions, setSelectOptions] = useState({});
    const [selectEntity, setSelectEntity] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); // State for toast messages

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const tablesResponse = await axios.get('http://localhost:5000/get-tables');
                setTables(tablesResponse.data.tables);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setError('Error fetching tables');
                setMessage('Error fetching tables'); // Set toast message
                console.error('Error fetching tables:', error);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        async function fetchTableData() {
            if (!selectedTable) return;
            try {
                setLoading(true);
                const [tableColumnsResponse, connectionvocResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/get-columns/${selectedTable}`),
                    axios.get(`http://localhost:5000/get-connectionvoc/${selectedTable}`)
                ]);
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
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setMessage('Error fetching table data'); // Set toast message
                console.error('Error fetching table data:', error);
            }
        }
        fetchTableData();
    }, [selectedTable]);

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
                } else if (column.vocS === 2) {
                    const selectedValue = selectEntity[column.tableC]?.data || '';
                    formData.columns.push(column.tableC);
                    formData.values.push(selectedValue);
                } else if (column.vocS === 1) {
                    const selectedValue = selectEntity[column.tableC]?.data || '';
                    formData.columns.push(column.tableC);
                    formData.values.push(selectedValue);
                }
            }
            
            await axios.post('http://localhost:5000/insert-data', formData);
            setMessage('Data inserted successfully'); // Set success message
            
            setSelectOptions({});
            setSelectEntity({});
            setSelectedTable('');
            setConnectionvoc([]);
        } catch (error) {
            setMessage('Error saving data'); 
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
                [vocName]: response.data.data 
            }));
        } catch (error) {
            setMessage('Error bringing vocabulary insertions'); // Set error message
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
            setMessage('Error fetching entity insertions'); // Set error message
            console.error('Error fetching entity insertions', error);
        }
    };

    return (
        <div style={{ marginBottom: '20px', paddingTop: '50px', paddingLeft: '10px', gap: '10px' }}>
            <h1>Documentation Page - Insert New Entity</h1>
            <div className="select-row">
                <div>Select Entity Category:</div>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <select value={selectedTable} onChange={handleTableSelect}>
                        <option value="">Select Entity</option>
                        {tables.map((table, index) => (
                            <option key={index} value={table}>{table}</option>
                        ))}
                    </select>
                )}
            </div>
            {error && <p className="error-message">{error}</p>}
            <div style={{ marginTop: '50px' }}>
                <label><b>ID:</b></label>
                <input 
                    className='inputID'
                    value="automatically assigned"
                    disabled />
            </div>
            
            <form onSubmit={handleSave}>
                {connectionvoc.length > 0 && (
                    <table className="form-table">
                        <tbody>
                            {connectionvoc.map((column, index) => (
                                <tr key={index}>
                                    <td><b>{column.tableC}:</b></td>
                                    <td>
                                        {column.vocS === 0 && (
                                            <input id={`${column.tableC}-input`} type="text"
                                            placeholder={
                                                column.vocT === 'INT' ? 'Enter number' :
                                                column.vocT === 'YEAR' ? 'YYYY' :
                                                column.vocT === 'DATE' ? 'YYYY-MM-DD' :
                                                column.vocT === 'DATETIME' ? 'YYYY-MM-DD HH:mm:ss' :
                                                column.vocT === 'TIME' ? 'HH:mm:ss' :
                                                column.vocT === 'Latitude' ? 'Enter Latitude:' :
                                                column.vocT === 'Longtitude' ? 'Enter Longtitude' :
                                                'Enter text'
                                            } />
                                        )}
                                        {column.vocS === 1 && (
                                            <select onChange={(event) => handleSelectChange(event, column)}>
                                                <option value="">Select {column.tableC}</option>
                                                {selectOptions[column.vocT] && selectOptions[column.vocT].map((option, optionIndex) => (
                                                    <option key={optionIndex} value={option.name}>{option.name} {option.broader}</option>
                                                ))}
                                            </select>
                                        )}
                                        {column.vocS === 2 && (
                                            <select onChange={(event) => handleSelectChange(event, column)}>
                                                <option value="">Select {column.tableC}</option>
                                                {Array.isArray(selectEntity[column.vocT]?.data) && selectEntity[column.vocT].data.map((option, optionIndex) => {
                                                    const { ID, ...otherColumns } = option;
                                                    const optionText = Object.values(otherColumns).join('-');
                                                    return <option key={optionIndex} value={option.ID}>{optionText}</option>;
                                                })}
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div>
                    <button type="submit" className='submitSave'>SAVE</button>
                </div>
            </form>

            {message && <Toast text={message} onClose={() => setMessage(null)} />} {/* Display toast */}
        </div>
    );
}

export default CreateNewEntity2;
