import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KnowledgeGraph = () => {
  const [entities, setEntities] = useState([]);
  const [connectionVocData, setConnectionVocData] = useState([]);
  const [ontologies, setOntologies] = useState([]);
  const [uriMappings, setUriMappings] = useState([]);
  const [uriPrefix, setUriPrefix] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const tablesResponse = await axios.get('http://localhost:5000/get-tables');
        const fetchedEntities = tablesResponse.data?.tables || [];

        // Fetch additional data for each entity
        const updatedEntities = await Promise.all(fetchedEntities.map(async (entity) => {
          const entityDataResponse = await axios.post('http://localhost:5000/read-data', { tableName: entity });
          return {
            name: entity,
            data: entityDataResponse.data.data
          };
        }));

        setEntities(updatedEntities);

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

  const generateUri = (prefix, tableName, id) => {
    return `${prefix}${tableName}/${id}`;
  };

  const getPredicateUri = (property) => {
    const mapping = uriMappings.find(mapping => mapping.columnN === property);
    return mapping ? mapping.ontologyProperty : property;
  };

  const getOntologyClass = (category) => {
    const ontology = ontologies.find(ont => ont.category === category);
    console.log(`Category: ${category}, Ontology: `, ontology); // Debugging line
    return ontology ? ontology.Ontology_Class : null;
  };

  return (
    <div>
      <h1>Knowledge Graph</h1>
      
      <div>
        {entities.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>subject</th>
                <th>predicate</th>
                <th>object</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity, entityIndex) => (
                entity.data.map((row, rowIndex) => {
                  const ontologyClass = getOntologyClass(entity.name);
                  return Object.entries(row).map(([property, value], propIndex) => (
                    <tr key={`${entityIndex}-${rowIndex}-${propIndex}`}>
                      <td>{'<' + generateUri(uriPrefix, entity.name, row.ID) + '>'}</td>
                      <td>{property === "ID" ? "a" : '<' + getPredicateUri(property) + '>'}</td>
                      <td>
                        {(property === "ID" || property === "a") ? 
                          (ontologyClass ? `<${ontologyClass}>` : "No ontology class found") :
                          (typeof value === 'string' && value.startsWith('http') ? `<${value}>` : `"${value}"`)
                        }
                      </td>
                    </tr>
                  ));
                })
              ))}
            </tbody>
          </table>
        ) : (
          <p>No entities found.</p>
        )}
      </div>
    </div>
  );
}

export default KnowledgeGraph;
