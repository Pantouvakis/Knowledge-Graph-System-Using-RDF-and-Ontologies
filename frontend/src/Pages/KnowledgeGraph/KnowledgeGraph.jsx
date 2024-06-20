import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KnowledgeGraph = () => {
  const [entities, setEntities] = useState([]);
  const [connectionVocData, setConnectionVocData] = useState([]);
  const [ontologies, setOntologies] = useState([]);
  const [uriMappings, setUriMappings] = useState([]);
  const [uriPrefix, setUriPrefix] = useState('');
  const [vocabularyTables, setVocabularyTables] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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
        const fetchedOntologies = ontologiesResponse.data?.data || [];
        setOntologies(fetchedOntologies);

        const uriResponse = await axios.get('http://localhost:5000/read-uri');
        setUriMappings(uriResponse.data?.data || []);

        const uriPrefixResponse = await axios.get('http://localhost:5000/get-uri-prefix');
        setUriPrefix(uriPrefixResponse.data?.uriPrefix || '');

        const vtablesResponse = await axios.get('http://localhost:5000/get-vtables');
        setVocabularyTables(vtablesResponse.data?.tables || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Ensure dependency array is empty to call fetchData only once

  const generateUri = (prefix, tableName, id) => {
    return `${prefix}${tableName.toLowerCase()}/${id}`;
  };

  const getPredicateUri = (property) => {
    const mapping = uriMappings.find(mapping => mapping.columnN === property);
    return mapping ? mapping.ontologyProperty : property;
  };

  const getConnection = (tableName, tableC) => {
    return connectionVocData.find(conn => conn.tableN === tableName && conn.tableC === tableC);
  };

  const getOntologyClass = (category) => {
    const ontology = ontologies.find(ont => ont.category.toLowerCase() === category.toLowerCase());
    return ontology ? ontology.Ontology_Class : null;
  };

  const generateRDFContent = () => {
    let rdfContent = '';

    entities.forEach((entity, entityIndex) => {
      entity.data.forEach((row, rowIndex) => {
        const ontologyClass = getOntologyClass(entity.name); // Define ontologyClass here

        Object.entries(row).forEach(([property, value], propIndex) => {
          const connection = getConnection(entity.name, property);
          const valueId = value?.ID || value; // Assume value is an object with an ID field or a primitive
          const subject = `<${generateUri(uriPrefix, entity.name, row.ID)}>`;
          const predicate = property === "ID" ? "a" : `<${getPredicateUri(property)}>`;
          let object;
          if (property === "ID") {
            object = ontologyClass ? `<${ontologyClass}>` : "No ontology class found";
          } else if (connection) {
            if (connection.vocS === 0) {
              object = typeof value === 'string' && value.startsWith('http') ? `<${value}>` : `"${value}"`;
            } else if (connection.vocS === 1) {
              object = `<${uriPrefix}${connection.vocT}/${valueId}>`;
            } else if (connection.vocS === 2) {
              object = `<${uriPrefix}${connection.vocT}/${row.ID}>`;
            }
          } else {
            object = typeof value === 'string' && value.startsWith('http') ? `<${value}>` : `"${value}"`;
          }

          rdfContent += `${subject} ${predicate} ${object} .\n`;
        });
      });
    });

    return rdfContent;
  };

  const downloadRDF = () => {
    const rdfContent = generateRDFContent();
    const blob = new Blob([rdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'knowledge_graph.rdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Knowledge Graph</h1>
      <button onClick={downloadRDF}>Download RDF</button>
      <div>
        {entities.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Predicate</th>
                <th>Object</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity, entityIndex) => (
                entity.data.map((row, rowIndex) => (
                  Object.entries(row).map(([property, value], propIndex) => {
                    const ontologyClass = getOntologyClass(entity.name);
                    const connection = getConnection(entity.name, property);
                    const valueId = value?.ID || value; // Assume value is an object with an ID field or a primitive
                    const subject = `<${generateUri(uriPrefix, entity.name, row.ID)}>`;
                    const predicate = property === "ID" ? "a" : `<${getPredicateUri(property)}>`;
                    let object;
                    if (property === "ID") {
                      object = ontologyClass ? `<${ontologyClass}>` : "No ontology class found";
                    } else if (connection) {
                      if (connection.vocS === 0) {
                        object = typeof value === 'string' && value.startsWith('http') ? `<${value}>` : `"${value}"`;
                      } else if (connection.vocS === 1) {
                        object = `<${uriPrefix}${connection.vocT}/${valueId}>`;
                      } else if (connection.vocS === 2) {
                        object = `<${uriPrefix}${connection.vocT}/${row.ID}>`;
                      }
                    } else {
                      object = typeof value === 'string' && value.startsWith('http') ? `<${value}>` : `"${value}"`;
                    }

                    return (
                      <tr key={`${entityIndex}-${rowIndex}-${propIndex}`}>
                        <td>{subject}</td>
                        <td>{predicate}</td>
                        <td>{object}</td>
                      </tr>
                    );
                  })
                ))
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
