import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KnowledgeGraph = () => {
  const [entities, setTables] = useState([]);
  const [connectionVocData, setConnectionVocData] = useState([]);
  const [ontologies, setOntologies] = useState([]);
  const [uriMappings, setUriMappings] = useState([]);
  const [uriPrefix, setUriPrefix] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const tablesResponse = await axios.get('http://localhost:5000/get-tables');
        setTables(tablesResponse.data?.tables || []);

        const connectionVocDataResponse = await axios.get('http://localhost:5000/get-connectionvoc2');
        setConnectionVocData(connectionVocDataResponse.data || []);

        const ontologiesResponse = await axios.get('http://localhost:5000/get-ontologies');
        setOntologies(ontologiesResponse.data?.data || []);

        const uriResponse = await axios.get('http://localhost:5000/read-uri');
        setUriMappings(uriResponse.data?.data || []);

        const uriPrefixResponse = await axios.get('http://localhost:5000/get-uri-prefix');
        setUriPrefix(uriPrefixResponse.data?.uriPrefix || '');

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const generateUri = (prefix, tableName) => {
    return `${prefix}${tableName}/`;
  };
  
  return (
    <div>
      <h1>Knowledge Graph</h1>
      <div>
  {entities.length > 0 ? (
    <table>
      <thead>
        <tr>
        <th>Column1</th>
        <th>Column2</th>
        <th>Column3</th>
        </tr>
      </thead>
      <tbody>
        {entities.map((table, index) => (
          <tr key={index}>
            <td>{'<' + generateUri(uriPrefix, table) + '>'}</td>
            <td>{table}</td>
            <td>{table}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No tables found.</p>
  )}
</div>

      
      <div>
        {connectionVocData.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Voc S</th>
                <th>Voc T</th>
                <th>Table Name</th>
                <th>Table Column</th>
              </tr>
            </thead>
            <tbody>
              {connectionVocData.map((data, index) => (
                <tr key={index}>
                  <td>{data.vocS}</td>
                  <td>{data.vocT}</td>
                  <td>{data.tableN}</td>
                  <td>{data.tableC}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No connection vocabulary data found.</p>
        )}
      </div>
      
      <div>
        {ontologies.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Ontology Class</th>
                <th>Property Name</th>
                <th>Property Value</th>
              </tr>
            </thead>
            <tbody>
              {ontologies.map((ontology, index) => (
                <tr key={index}>
                  <td>{ontology.category}</td>
                  <td>{ontology.Ontology_Class}</td>
                  <td>{ontology.Property_Name}</td>
                  <td>{ontology.Property_Value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No ontologies found.</p>
        )}
      </div>
      
      <div>
        {uriMappings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Table Name</th>
                <th>Column Name</th>
                <th>Ontology Property</th>
              </tr>
            </thead>
            <tbody>
              {uriMappings.map((mapping, index) => (
                <tr key={index}>
                  <td>{mapping.tableN}</td>
                  <td>{mapping.columnN}</td>
                  <td>{mapping.ontologyProperty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No URI mappings found.</p>
        )}
      </div>
    </div>
  );
}

export default KnowledgeGraph;
