import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DownloadRDF from './DownloadRDF.jsx';

const KnowledgeGraph = () => {
  const [entities, setEntities] = useState([]);
  const [connectionVocData, setConnectionVocData] = useState([]);
  const [ontologies, setOntologies] = useState([]);
  const [uriMappings, setUriMappings] = useState([]);
  const [uriPrefix, setUriPrefix] = useState('');
  const [vocabularyTables, setVocabularyTables] = useState([]);
  const [vocabularyData, setVocabularyData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tablesResponse = await axios.get('http://localhost:5000/get-tables');
        const fetchedEntities = tablesResponse.data?.tables || [];

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
        const fetchedVocabularyTables = vtablesResponse.data?.tables || [];
        setVocabularyTables(fetchedVocabularyTables);

      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchVocabularyData = async () => {
      try {
        if (vocabularyTables.length === 0) {
          return;
        }

        const fetchPromises = vocabularyTables.map(async (table) => {
          const vdataResponse = await axios.post('http://localhost:5000/read-vdata', { tableName: table });
          return { tableName: table, data: vdataResponse.data.data || [] };
        });

        const fetchedVocabularyData = await Promise.all(fetchPromises);

        const updatedVocabularyData = fetchedVocabularyData.reduce((acc, curr) => {
          acc[curr.tableName] = curr.data;
          return acc;
        }, {});

        setVocabularyData(updatedVocabularyData);

      } catch (error) {
        console.error('Error fetching vocabulary data:', error);
      }
    };

    fetchVocabularyData();
  }, [vocabularyTables]);

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
        const ontologyClass = getOntologyClass(entity.name);

        // Add RDF triple for each row
        Object.entries(row).forEach(([property, value], propIndex) => {
          const connection = getConnection(entity.name, property);
          const valueId = value?.ID || value;
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

        // Check if entity name is in vocabularyTables to add extra triple
        if (vocabularyTables.includes(entity.name)) {
          const insertionSubject = `<${uriPrefix}${entity.name}/insertion>`;
          const insertionPredicate = "a";
          const insertionObject = "<http://www.w3.org/2004/02/skos/core#Concept>";

          rdfContent += `${insertionSubject} ${insertionPredicate} ${insertionObject} .\n`;
        }
      });
    });

    Object.entries(vocabularyData).forEach(([tableName, tableData]) => {
      tableData.forEach((row) => {
        const subject = `<${uriPrefix}${tableName.toLowerCase()}/${row.name}>`;
        let predicate = "a";
        let object = "<http://www.w3.org/2004/02/skos/core#Concept>";
        rdfContent += `${subject} ${predicate} ${object} .\n`;

        predicate = "<http://www.w3.org/2004/02/skos/core#prefLabel>";
        object = `"${row.name}"`;
        rdfContent += `${subject} ${predicate} ${object} .\n`;

        if (row.broader) {
          predicate = "<http://www.w3.org/2004/02/skos/core#broader>";
          object = `<${uriPrefix}${tableName.toLowerCase()}/${row.broader.replace(" ", "_")}>`;
          rdfContent += `${subject} ${predicate} ${object} .\n`;

          const broaderSubject = `<${uriPrefix}${tableName.toLowerCase()}/${row.broader.replace(" ", "_")}>`;
          const broaderPredicate = "<http://www.w3.org/2004/02/skos/core#prefLabel>";
          const broaderObject = `"${row.broader}"`;
          rdfContent += `${broaderSubject} ${broaderPredicate} ${broaderObject} .\n`;
        }
      });
    });

    return rdfContent;
  };

  return (
    <div>
      <h1>Knowledge Graph</h1>
      <DownloadRDF generateRDFContent={generateRDFContent} />
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
                    const valueId = value?.ID || value;
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
                        object = `<${uriPrefix}${connection.vocT}/${valueId}>`;
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
              {Object.entries(vocabularyData).map(([tableName, tableData], tableIndex) => (
                tableData.map((row, rowIndex) => {
                  const subject = `<${uriPrefix}${tableName.toLowerCase()}/${row.name}>`;
                  let predicate = "a";
                  let object = "<http://www.w3.org/2004/02/skos/core#Concept>";

                  const triples = [
                    { predicate, object },
                    { predicate: "<http://www.w3.org/2004/02/skos/core#prefLabel>", object: `"${row.name}"` }
                  ];

                  if (row.broader) {
                    triples.push({
                      predicate: "<http://www.w3.org/2004/02/skos/core#broader>",
                      object: `<${uriPrefix}${tableName.toLowerCase()}/${row.broader.replace(" ", "_")}>`
                    });

                    triples.push({
                      subject: `<${uriPrefix}${tableName.toLowerCase()}/${row.broader.replace(" ", "_")}>`,
                      predicate: "<http://www.w3.org/2004/02/skos/core#prefLabel>",
                      object: `"${row.broader}"`
                    });
                  }

                  return triples.map((triple, tripleIndex) => (
                    <tr key={`${tableIndex}-${rowIndex}-${tripleIndex}`}>
                      <td>{triple.subject || subject}</td>
                      <td>{triple.predicate}</td>
                      <td>{triple.object}</td>
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
};

export default KnowledgeGraph;
