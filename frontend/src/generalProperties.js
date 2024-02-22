import React from 'react';


function generalProperties() {
  
  return (

    <div style={{marginBottom: '20px',paddingTop: "100px",paddingLeft: "10px", gap: '10px'}}>
      <div>
        <label htmlFor="input1">Title:</label>
        <input type="text" id="input1" name="input1" 
        style={{marginBottom: '20px'}}/>
      </div>
      <div>
        <label htmlFor="input2">Subtitle:</label>
        <input type="text" id="input2" name="input2" 
        style={{marginBottom: '20px'}}/>
      </div>
      <div>
        <label htmlFor="input3">Description:</label>
        <input type="text" id="input3" name="input3" 
         style={{marginBottom: '20px', width: '600px', padding: '100px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}/>
      </div>
      <div>
        <label htmlFor="input4">URI prefix:</label>
        <input type="text" id="input4" name="input4" 
        style={{marginBottom: '20px'}}/>
      </div>
      <button 
      style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>SAVE</button>
    </div>
  );
}

export default generalProperties;
