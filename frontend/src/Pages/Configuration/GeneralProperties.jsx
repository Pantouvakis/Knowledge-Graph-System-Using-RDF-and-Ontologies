import React, { useState } from 'react';
import axios from 'axios';

function GeneralProperties  (){
  const [isLoading, setIsLoading] = useState(false);

  const handleInsertData = () => {
    setIsLoading(true);
  }

  const data = {
    column2: 'input1',
    column3: 'input2',
    column4: 'input3',
    column5: 'input4'
  };

  axios.post('http://localhost:5000/insert-general-properties', { data })
  .then(response => {
    console.log(response.data); // Log the response data
  })
  .catch(error => {
    console.error('Error inserting data:', error); // Handle errors
  });

  return (

    <div style={{marginBottom: '20px',paddingTop: "100px",paddingLeft: "10px", gap: '10px'}}>
      <div>
        <label htmlFor="input1">Title:</label>
        <input type="text" id="input1" name="input1" placeholder='Enter Title Here'
        style={{marginBottom: '20px', backgroundColor:'lightgrey'}}/>
      </div>
      <div>
        <label htmlFor="input2">Subtitle:</label>
        <input type="text" id="input2" name="input2" placeholder='Enter Subtitle Here'
        style={{marginBottom: '20px', backgroundColor:'lightgrey'}}/>
      </div>
      <div>
        <label htmlFor="input3">Description:</label>
        <input type="text" id="input3" name="input3" placeholder='Enter Description Here'
         style={{ backgroundColor:'lightgrey',marginBottom: '20px', width: '600px', padding: '100px', boxSizing: 'border-box' }}/>
      </div>
      <div>
        <label htmlFor="input4">URI prefix:</label>
        <input type="text" id="input4" name="input4" placeholder='Enter URI Here'
        style={{marginBottom: '20px', backgroundColor:'lightgrey'}}/>
      </div>
      <button onClick={handleInsertData} disabled={isLoading}
      
      style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>
        SAVE
        </button>
    </div>
  );
}

export default GeneralProperties;
