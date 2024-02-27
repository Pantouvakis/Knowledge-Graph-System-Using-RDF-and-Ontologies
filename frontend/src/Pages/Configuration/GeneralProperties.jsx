import React, { useState } from 'react';
import axios from 'axios';

function GeneralProperties() {
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    column1: '',
    column2: '',
    column3: '',
    column4: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/insert-general-properties', { data: formData });
      setMessage(response.data.message);
      // Clear form data after successful submission
      setFormData({
        column1: '',
        column2: '',
        column3: '',
        column4: ''
      });
    } catch (error) {
      setMessage('Error saving data. See console for details.');
      console.error('Error saving data:', error.message);
    }
  };

  return (
    <div className="main" style={{ marginBottom: '20px', paddingTop: "100px", paddingLeft: "10px", gap: '10px' }}>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="input1">Title:</label>
          <input
            type="text"
            name="column1"
            placeholder='Enter Title Here'
            style={{ marginLeft: '46px', width: '600px', marginBottom: '20px', backgroundColor: 'lightgrey' }}
            value={formData.column1}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="input2">Subtitle:</label>
          <input
            type="text"
            name="column2"
            placeholder='Enter Subtitle Here'
            style={{ marginLeft: '25px', width: '600px', marginBottom: '20px', backgroundColor: 'lightgrey' }}
            value={formData.column2}
            onChange={handleChange}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <label htmlFor="input3" >Description:</label>
          <textarea
            rows="10"
            cols="80"
            name="column3"
            id="myTextarea"
            placeholder='Enter Description Here'
            style={{ backgroundColor: 'lightgrey', marginBottom: '20px', width: '600px', padding: '10px' }}
            value={formData.column3}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="input4">URI prefix:</label>
          <input
            type="text"
            name="column4"
            placeholder='Enter URI Here'
            style={{ marginBottom: '20px', backgroundColor: 'lightgrey', width: '600px' }}
            value={formData.column4}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer' }}
        >
          SAVE
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default GeneralProperties;
