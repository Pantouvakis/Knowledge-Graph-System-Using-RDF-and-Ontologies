import React, { useState } from 'react';
import './Styles.css';

function Popup({ columnDataTypes, onSubmit, onClose }) {
    const [columnName, setColumnName] = useState('');
    const [selectedDataType, setSelectedDataType] = useState('');
    const [uriName,setUriName] = useState('');

    const handleDataTypeChange = event => {
        setSelectedDataType(event.target.value);
    };
    const handleUriName = event => {
        setUriName(event.target.value);
    };
    

    const handleSubmit = () => {
        if (!columnName || !selectedDataType) {
            alert('Please fill in Column Name and Data Type');
            return;
        }
        onSubmit(columnName, selectedDataType, uriName);
        setColumnName('');
        setSelectedDataType('');
        setUriName('');
    };

    return (
        <div className="popup">
            <div className="popup-content">
              
                <label htmlFor="columnName">Column Name: </label>
                <input
                    type="text"
                    id="columnName"
                    placeholder='Type here:'
                    value={columnName}
                    onChange={e => setColumnName(e.target.value)}
                />
                <label htmlFor="dataType"> Data Type: </label>
                <select
                    value={selectedDataType}
                    onChange={handleDataTypeChange}>
                    <option value="">Select Data Type</option>
                    
                    {columnDataTypes.map((column, index) => (
                        <option key={index} value={column}>{column}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="uri">Uri: </label>
                <input
                type="text"
                id='uriName'
                placeholder='Optionally Type URI:'
                value={uriName}
                onChange={handleUriName}
                style={{width: '450px', marginTop: '10px'}}></input>
            </div>
            <button 
                style={{marginTop: '10px'}}
                className='create-new'
                onClick={handleSubmit}
                >Submit</button>
            
        </div>
    );
}

export default Popup;
