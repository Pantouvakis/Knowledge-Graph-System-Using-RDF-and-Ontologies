import React, { useState } from 'react';
import axios from 'axios';
import { readData, updateData } from '../../databaseUtils.js';

function GeneralProperties  (){

  const saveDataToBackend = () => {
    // Assuming data contains the values you want to send to the backend
    const data = {
      column1: 'value1',
      column2: 'value2',
      column3: 'value3',
      column4: 'value4'
    };

    fetch('/insert-general-properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save data');
      }
      return response.json();
    })
    .then(data => {
      console.log('Data saved successfully:', data);
      // Optionally, you can perform actions after successful save
    })
    .catch(error => {
      console.error('Error saving data:', error.message);
      // Handle errors here
    });
  };

  // Function to handle button click event
  const handleSaveButtonClick = () => {
    // Call the function to save data to backend
    saveDataToBackend();
  };


  return (

    <div style={{marginBottom: '20px',paddingTop: "100px",paddingLeft: "10px", gap: '10px'}}>
      <div>
        <label htmlFor="input1">Title:</label>
        <input type="text" placeholder='Enter Title Here'
        style={{marginBottom: '20px', backgroundColor:'lightgrey'}}/>
      </div>
      <div>
        <label htmlFor="input2">Subtitle:</label>
        <input type="text" placeholder='Enter Subtitle Here'
        style={{marginBottom: '20px', backgroundColor:'lightgrey'}}/>
      </div>
      <div>
        <label htmlFor="input3">Description:</label>
        <input type="text" placeholder='Enter Description Here'
         style={{ backgroundColor:'lightgrey',marginBottom: '20px', width: '600px', padding: '100px', boxSizing: 'border-box' }}/>
      </div>
      <div>
        <label htmlFor="input4">URI prefix:</label>
        <input type="text" placeholder='Enter URI Here'
        style={{marginBottom: '20px', backgroundColor:'lightgrey'}}/>
      </div>
      <button onClick={handleSaveButtonClick}
      
      style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>
        SAVE
        </button>
    </div>
  );
}

export default GeneralProperties;
