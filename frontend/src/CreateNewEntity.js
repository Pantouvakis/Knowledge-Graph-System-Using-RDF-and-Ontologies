import React, { useState, useRef } from 'react';

const TableCreator = () => {
  const [tables, setTables] = useState([]); // Store table data
  const [currentTable, setCurrentTable] = useState(null); // Track currently selected table
  const [columnName, setColumnName] = useState(''); // Input for column name
  const [columnType, setColumnType] = useState(''); // Selected data type

  const handleCreateTable = () => {
    // Create a new table object with initial "ID" column
    const newTable = {
      id: Math.random().toString(36).substring(2, 15), // Generate unique ID
      columns: [{ name: 'ID', type: 'string' }], // Initial "ID" column
      data: [], // Empty data array
    };
    setTables([...tables, newTable]); // Add new table to state
    setCurrentTable(newTable); // Set new table as currently selected
  };

  const handleAddColumn = () => {
    // Validate column name and data type
    if (!columnName || !columnType) {
      // Handle validation errors, e.g., display error message
      return;
    }

    // Update current table's columns and data
    const updatedTable = {
      ...currentTable,
      columns: [...currentTable.columns, { name: columnName, type: columnType }],
      data: currentTable.data.map((row) => ({ ...row, [columnName]: '' })), // Add new column to each data row
    };

    // Update state with modified table
    setTables((prevTables) =>
      prevTables.map((t) => (t.id === currentTable.id ? updatedTable : t))
    );

    // Clear input fields
    setColumnType('');
    setColumnType('');
  };

  // ... rest of the component (render function, UI elements, etc.)
};