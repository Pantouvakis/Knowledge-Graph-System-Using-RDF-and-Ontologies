import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../../Toast.jsx';

function GeneralProperties() {
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    descript: '',
    UriPrefix: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-general-properties');
        const data = response.data;
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          descript: data.descript || '',
          UriPrefix: data.UriPrefix || ''
        });
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };
    fetchData();
  }, []);

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
      const response = await axios.post('http://localhost:5000/insert-update', { data: formData });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error saving data. See console for details.');
      console.error('Error saving data:', error.message);
    }
  };

  const closeToast = () => {
    setMessage('');
  };

  return (
    <div className="main" style={{ marginBottom: '20px', paddingTop: "50px", paddingLeft: "10px", gap: '10px' }}>
      <h1>Configuration Page - General Properties</h1>
      <form onSubmit={handleSubmit}>
        <table className="general-properties-table">
          <tbody>
            <tr>
              <td><label htmlFor="title">Title:</label></td>
              <td><input
                className='general-properties-input'
                type="text"
                name="title"
                placeholder='Enter Title Here'
                value={formData.title}
                onChange={handleChange}
              /></td>
            </tr>
            <tr>
              <td><label htmlFor="subtitle">Subtitle:</label></td>
              <td><input
                className='general-properties-input'
                type="text"
                name="subtitle"
                placeholder='Enter Subtitle Here'
                value={formData.subtitle}
                onChange={handleChange}
              /></td>
            </tr>
            <tr>
              <td><label htmlFor="descript">Description:</label></td>
              <td>
                <textarea
                  name="descript"
                  id="textarea2"
                  placeholder='Enter Description Here'
                  style={{ width: '600px', padding: '10px', height: '500px' }}
                  value={formData.descript}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td><label htmlFor="UriPrefix">URI prefix:</label></td>
              <td><input
                className='general-properties-input'
                type="text"
                name="UriPrefix"
                placeholder='Enter URI Here'
                value={formData.UriPrefix}
                onChange={handleChange}
              /></td>
            </tr>
          </tbody>
        </table>
        <button
          className='submitSave'
          type="submit">
          SAVE
        </button>
      </form>
      {message && <Toast text={message} onClose={closeToast} />} {/* Display Toast component */}
    </div>
  );
}

export default GeneralProperties;
