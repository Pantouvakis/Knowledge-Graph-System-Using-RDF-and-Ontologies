import axios from 'axios';

export const createTable = async (tableName) => {
  try {
    await axios.post('http://localhost:5000/create-table', { tableName });
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

export const addColumn = async (tableName, columnName, columnType) => {
  try {
    await axios.post('http://localhost:5000/add-column', { tableName, columnName, columnType });
  } catch (error) {
    console.error('Error adding column:', error);
  }
};

export const deleteColumn = async (tableName, columnName) => {
  try {
    await axios.post('http://localhost:5000/delete-column', { tableName, columnName });
  } catch (error) {
    console.error('Error deleting column:', error);
  }
};

export const deleteTable = async (tableName) => {
  try {
    await axios.post('http://localhost:5000/delete-table', { tableName });
  } catch (error) {
    console.error('Error deleting table:', error);
  }
};

export const readTable = async (tableName) => {
  try {
    const response = await axios.get('http://localhost:5000/get-tables');
    console.log('Data:', response.data);
    return response; // Return the response object
  } catch (error) {
    console.error('Error reading data:', error);
    throw error; // Rethrow the error for handling in the calling code
  }
};


export const readData = async (tableName) => {
  try {
    const response = await axios.post('http://localhost:5000/read-data', { tableName });
    return response; // Return the entire response object
  } catch (error) {
    throw error; // Rethrow the error for handling in the component
  }
};

export const updateData = async (tableName, newData, condition) => {
  try {
    await axios.post('http://localhost:5000/update-data', { tableName, newData, condition });
  } catch (error) {
    console.error('Error updating data:', error);
  }
};
