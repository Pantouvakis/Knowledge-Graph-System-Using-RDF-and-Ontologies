import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Styles.css';
import { deleteTable } from '../../databaseUtils.js';


function EntityCategories() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableColumns, setTableColumns]=useState([]);
    
    const [message, setMessage] = useState(null);

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
                if (selectedTable){
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
          console.log('Success');
          window.location.reload();
        } catch (error) {
          setMessage('Error deleting table. See console for details.');
          console.error('Error deleting table:', error);
        }
      };

    const handleTableSelect = (event) => {
        setSelectedTable(event.target.value);
    };


    return (
        <div style={{ marginBottom: '20px', paddingTop: "50px", paddingLeft: "10px", gap: '10px' }}>
            <h1>Configuration Page - Entity Categories</h1>
            <h3>Current List:</h3>
            <form onSubmit={handleDelete}>
                <select value={selectedTable} onChange={handleTableSelect}>
                    <div>Select a table:</div>
                    <option value="">Select a table</option>
                    {tables.map((table, index) => (
                        <option key={index} value={table}>{table}</option>
                    ))}
                </select>
                {selectedTable && (
                    <div style={{paddingTop: "30px", display: "flex"}}> 
                        <div style={{marginRight: '10px'}}>Name:</div>
                        <div className='a-border'>{selectedTable}</div>
                    </div>
                )}
                { tableColumns.length>0 &&(
                    <div>
                        <div>Documentation fields:</div>
                        <ul>
                            {tableColumns.map((column,index)=>(
                                <li key={index} >
                                    {column.name}:{column.dataType}
                                    <div>
                                        <button className='c-del-but'>
                                        delete</button>
                                        <button className='set-ontology-property'>
                                            set ontology property</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div>
                    <button className='submitSave'>SAVE</button>
                    <button
                    onClick={handleDelete}
                    className='submitDelete'>DELETE</button>
                </div>
            </form>
        </div>
    );
}

export default EntityCategories;
