import React from 'react';


const EntryCategories =() =>{  
  return (
    <div style={{marginBottom: '20px',paddingTop: "200px",paddingLeft: "10px", gap: '10px'}}>
      <div>
        <label htmlFor="input1">Title:</label>
        <input type="text" id="input1" name="input1" 
        style={{marginBottom: '20px'}}/>
      </div>
      <div>
        <label htmlFor="input2">Subtitle:</label>
        <input type="text" id="input2" name="input2" color="darkgrey" 
        style={{marginBottom: '20px'}}/>
      </div>
      <button 
      style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>SAVE</button>
    </div>
  );
}

export default EntryCategories;