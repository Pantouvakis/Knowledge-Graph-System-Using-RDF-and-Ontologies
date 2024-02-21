import React, { useState } from 'react';
import { createTable, addColumn, deleteColumn, deleteTable, readData, updateData } from './databaseUtils';

function App() {
  const [tableName, setTableName] = useState('');
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('');
  const [newData, setNewData] = useState({});
  const [condition, setCondition] = useState({});

  const handleCreateTable = async () => {
    await createTable(tableName);
  };

  const handleAddColumn = async () => {
    await addColumn(tableName, columnName, columnType);
  };

  const handleDeleteColumn = async () => {
    await deleteColumn(tableName, columnName);
  };

  const handleDeleteTable = async () => {
    await deleteTable(tableName);
  };

  const handleReadData = async () => {
    await readData(tableName);
  };

  const handleUpdateData = async () => {
    await updateData(tableName, newData, condition);
  };


  return (
    <div>
      <h1>Configuration</h1>
      <div>
        <h2>Create Table</h2>
        <div>
          <input
            type="text"
            placeholder="Enter table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          <button onClick={handleCreateTable}>Create Table</button>
        </div>
      </div>
      <div>
        <h2>Add Column</h2>
        <div>
          <input
            type="text"
            placeholder="Enter table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter column name"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter column type"
            value={columnType}
            onChange={(e) => setColumnType(e.target.value)}
          />
          <button onClick={handleAddColumn}>Add Column</button>
        </div>
      </div>
      <div>
        <h2>Delete Column</h2>
        <div>
          <input
            type="text"
            placeholder="Enter table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter column name"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
          />
          <button onClick={handleDeleteColumn}>Delete Column</button>
        </div>
      </div>
      <div>
        <h2>Delete Table</h2>
        <div>
          <input
            type="text"
            placeholder="Enter table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          <button onClick={handleDeleteTable}>Delete Table</button>
        </div>
      </div>
      <div>
        <h2>Read Data</h2>
        <div>
          <input
            type="text"
            placeholder="Enter table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          <button onClick={handleReadData}>Read Data</button>
        </div>
      </div>
      <div>
        <h2>Update Data</h2>
        <div>
          <input
            type="text"
            placeholder="Enter table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          {/* Input fields for new data */}
          <input
            type="text"
            placeholder="New Data (JSON)"
            value={JSON.stringify(newData)}
            onChange={(e) => setNewData(JSON.parse(e.target.value))}
          />
          {/* Input fields for condition */}
          <input
            type="text"
            placeholder="Condition (JSON)"
            value={JSON.stringify(condition)}
            onChange={(e) => setCondition(JSON.parse(e.target.value))}
          />
          <button onClick={handleUpdateData}>Update Data</button>
        </div>
      </div>
    </div>
  );
}

export default App;