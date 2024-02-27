import React, { useState } from 'react';
import axios from 'axios';

const Browsing = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const handleReadData = async () => {
    const tableName = 'generalproperties';
    
    try {
      const response = await axios.post('http://localhost:5000/read-data', { tableName });
      setData(response.data.data); // Assuming the data structure is an array of objects
      setError(null);
    } catch (error) {
      console.error('Error reading data:', error);
      setError('Error reading data. See console for details.');
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Browsing Data</h2>
      <button onClick={handleReadData}>Read Data</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border="1" style={{ marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ width: '200px', height: '50px', textAlign: 'center', verticalAlign: 'middle' }}>Column 1</th>
            <th style={{ width: '200px', height: '50px', textAlign: 'center', verticalAlign: 'middle' }}>Column 2</th>
            <th style={{ width: '200px', height: '50px', textAlign: 'center', verticalAlign: 'middle' }}>Column 3</th>
            <th style={{ width: '200px', height: '50px', textAlign: 'center', verticalAlign: 'middle' }}>Column 4</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td style={{ width: '200px', height: '50px', textAlign: 'center', verticalAlign: 'middle' }}>{row.column1}</td>
              <td style={{ width: '200px', height: '50px', textAlign: 'center', verticalAlign: 'middle' }}>{row.column2}</td>
              <td style={{ width: '200px', height: '50px', textAlign: 'center', verticalAlign: 'middle' }}>{row.column3}</td>
              <td style={{ width: '200px', height: '50px', textAlign: 'center', verticalAlign: 'middle' }}>{row.column4}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Browsing;
