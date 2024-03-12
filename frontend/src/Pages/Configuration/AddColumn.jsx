import React, { useState } from 'react';

function Popup({ columnDataTypes, onSubmit, onClose }) {
    const [columnName, setColumnName] = useState('');
    const [selectedDataType, setSelectedDataType] = useState('');

    const handleDataTypeChange = event => {
        setSelectedDataType(event.target.value);
    };

    const handleSubmit = () => {
        if (!columnName || !selectedDataType) {
            alert('Please fill in all fields');
            return;
        }
        onSubmit(columnName, selectedDataType);
        setColumnName('');
        setSelectedDataType('');
    };

    return (
        <div className="popup">
            <div className="popup-content">
              
                <label htmlFor="columnName">Column Name:</label>
                <input
                    type="text"
                    id="columnName"
                    value={columnName}
                    onChange={e => setColumnName(e.target.value)}
                />
                <label htmlFor="dataType">Data Type:</label>
                <select
                    value={selectedDataType}
                    onChange={handleDataTypeChange}
                >
                    <option value="">Select Data Type</option>
                    
                    {columnDataTypes.map((column, index) => (
                        <option key={index} value={column}>{column}</option>
                    ))}
                </select>
                <button onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
}

export default Popup;
