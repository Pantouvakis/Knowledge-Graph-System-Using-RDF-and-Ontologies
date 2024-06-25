import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DownloadRDF from './DownloadRDF.jsx';
import { Table } from 'react-bootstrap'; // Assuming you have installed react-bootstrap

const KnowledgeGraph = () => {
  const [entities, setEntities] = useState([]);
  const [connectionVocData, setConnectionVocData] = useState([]);
  const [ontologies, setOntologies] = useState([]);
  const [uriMappings, setUriMappings] = useState([]);
  const [uriPrefix, setUriPrefix] = useState('');
  const [vocabularyTables, setVocabularyTables] = useState([]);
  const [vocabularyData, setVocabularyData] = useState({});
  const [rdfContent, setRdfContent] = useState('');

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

        const [connectionVocDataResponse, ontologiesResponse, uriResponse, uriPrefixResponse, vtablesResponse] = await Promise.all([
          axios.get('http://localhost:5000/get-connectionvoc2'),
          axios.get('http://localhost:5000/get-ontologies'),
          axios.get('http://localhost:5000/read-uri'),
          axios.get('http://localhost:5000/get-uri-prefix'),
          axios.get('http://localhost:5000/get-vtables')
        ]);

        setConnectionVocData(connectionVocDataResponse.data || []);
        setOntologies(ontologiesResponse.data?.data || []);
        setUriMappings(uriResponse.data?.data || []);
        setUriPrefix(uriPrefixResponse.data?.uriPrefix || '');
        setVocabularyTables(vtablesResponse.data?.tables || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchVocabularyData = async () => {
      try {
        if (vocabularyTables.length === 0) return;

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

  const generateUri = (prefix, tableName, id) => `${prefix}${tableName.toLowerCase()}/${id}`;

  const getPredicateUri = (property, tableN) => {
    const mapping = uriMappings.find(mapping => mapping.columnN === property && mapping.tableN === tableN);
    return mapping ? mapping.ontologyProperty : property;
  };

  const getConnection = (tableName, tableC) => connectionVocData.find(conn => conn.tableN === tableName && conn.tableC === tableC);

  const getOntologyClass = (category) => {
    const ontology = ontologies.find(ont => ont.category.toLowerCase() === category.toLowerCase());
    return ontology ? ontology.Ontology_Class : null;
  };

  const generateRDFContent = () => {
    let rdfContent = '';

    entities.forEach((entity) => {
      entity.data.forEach((row) => {
        const ontologyClass = getOntologyClass(entity.name);
        Object.entries(row).forEach(([property, value]) => {
          const connection = getConnection(entity.name, property);
          const valueId = value?.ID || value;
          const subject = `<${generateUri(uriPrefix, entity.name, row.ID)}>`;
          const predicate = property === "ID" ? "a" : `<${getPredicateUri(property, entity.name)}>`;
          let object;

          if (property === "ID") {
            object = ontologyClass ? `<${ontologyClass}>` : "No ontology class found";
          } else if (connection) {
            if (connection.vocS === 0) {
              let type;
              switch (connection.vocT) {
                case "Whole number":
                  type = "integer";
                  break;
                case "Decimal number":
                  type = "double";
                  break;
                case "Year":
                  type = "gYear";
                  break;
                case "Date":
                  type = "date";
                  break;
                case "Time":
                  type = "time";
                  break;
                case "Datetime":
                  type = "dateTime";
                  break;
                default:
                  type = "string";
                  break;
              }
              if (connection.vocT === "Text" || connection.vocT === "Long text") {
                object = typeof value === 'string' && value.startsWith('http') 
                         ? `<${value}>` 
                         : `"${value}"`;
              } else if (connection.vocT === "Latitude" || connection.vocT === "Longitude") {
                object = typeof value === 'string' && value.startsWith('http') 
                         ? `<${value}>` 
                         : `"${String(value).replace(".", "")}"`;
              } else {
                object = typeof value === 'string' && value.startsWith('http') 
                         ? `<${value}>` 
                         : `"${value}"^^<http://www.w3.org/2001/XMLSchema#${type}>`;
              }
            } else if (connection.vocS === 1 || connection.vocS === 2) {
              object = `<${uriPrefix}${connection.vocT}/${valueId}>`;
            }
          } else {
            object = typeof value === 'string' && value.startsWith('http') 
                     ? `<${value}>` 
                     : `"${value}"`;
          }

          rdfContent += `${subject} ${predicate} ${object} .\n`;

          if (property === "ID") {
            ontologies.forEach((ontology) => {
              if (ontology.Property_Name && ontology.Property_Value) {
                const secondaryPredicate = `<${ontology.Property_Name}>`;
                const secondaryObject = ontology.Property_Value.startsWith('http')
                ? `<${ontology.Property_Value}>`
                : `"${ontology.Property_Value}"`;
                rdfContent += `${subject} ${secondaryPredicate} ${secondaryObject} .\n`;
              }
            });
          }
        });

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

    setRdfContent(rdfContent); // Set the generated RDF content to state
  };

  useEffect(() => {
    generateRDFContent(); // Call generateRDFContent whenever dependencies change
  }, [entities, connectionVocData, ontologies, uriMappings, uriPrefix, vocabularyTables, vocabularyData]);

  // Parse RDF content into an array of triples
  const parseRDFContent = (rdfContent) => {
    const lines = rdfContent.split('\n').filter(line => line.trim() !== '');
    const triples = lines.map(line => {
      const [subject, predicate, object] = line.split(' ');
      return { subject, predicate, object };
    });
    return triples;
  };

  const triples = parseRDFContent(rdfContent);

  return (
    <div>
      <h1>Knowledge Graph</h1>
      <DownloadRDF generateRDFContent={generateRDFContent} />
      <div>
        <div style={{ marginTop: '20px' }}>
          <h2>Generated RDF Triples:</h2>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Predicate</th>
                <th>Object</th>
              </tr>
            </thead>
            <tbody>
              {triples.map((triple, index) => (
                <tr key={index}>
                  <td>{triple.subject}</td>
                  <td>{triple.predicate}</td>
                  <td>{triple.object}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
