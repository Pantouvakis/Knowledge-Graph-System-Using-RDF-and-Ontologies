import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap';
import DownloadRDF from './DownloadRDF.jsx';
import {
  generateUri,
  getPredicateUri,
  getConnection,
  getOntologyClass,
  getOntologyTriples,
  getRdfTypeObject
} from './rdfHelpers';

const KnowledgeGraph = () => {
  const [entities, setEntities] = useState([]);
  const [connectionVocData, setConnectionVocData] = useState([]);
  const [ontologies, setOntologies] = useState([]);
  const [uriMappings, setUriMappings] = useState([]);
  const [uriPrefix, setUriPrefix] = useState('');
  const [vocabularyTables, setVocabularyTables] = useState([]);
  const [vocabularyData, setVocabularyData] = useState({});
  const [rdfContent, setRdfContent] = useState('');

  const generateRDFContent = () => {
    let rdfContent = '';

    entities.forEach((entity) => {
      entity.data.forEach((row) => {
        const ontologyClass = getOntologyClass(entity.name, ontologies);
        const subject = `<${generateUri(uriPrefix, entity.name, row.ID)}>`;

        Object.entries(row).forEach(([property, value]) => {
          const connection = getConnection(entity.name, property, connectionVocData);
          const valueId = value?.ID || value;
          const predicate = property === "ID" ? "a" : `<${getPredicateUri(property, entity.name, uriMappings)}>`;
          let object;

          if (property === "ID") {
            object = ontologyClass ? `<${ontologyClass}>` : "No ontology class found";
          } else if (connection) {
            object = getRdfTypeObject(value, connection, uriPrefix);
          } else {
            object = typeof value === 'string' && value.startsWith('http') ? `<${value}>` : `"${value}"`;
          }

          rdfContent += `${subject} ${predicate} ${object} .\n`;

          if (property === "ID") {
            rdfContent += getOntologyTriples(subject, ontologies.filter(ont => ont.category.toLowerCase() === entity.name.toLowerCase()));
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
        rdfContent += `${subject} a <http://www.w3.org/2004/02/skos/core#Concept> .\n`;
        rdfContent += `${subject} <http://www.w3.org/2004/02/skos/core#prefLabel> "${row.name}" .\n`;

        if (row.broader) {
          const broaderSubject = `<${uriPrefix}${tableName.toLowerCase()}/${row.broader.replace(" ", "_")}>`;
          rdfContent += `${subject} <http://www.w3.org/2004/02/skos/core#broader> ${broaderSubject} .\n`;
          rdfContent += `${broaderSubject} <http://www.w3.org/2004/02/skos/core#prefLabel> "${row.broader}" .\n`;
        }
      });
    });

    setRdfContent(rdfContent);
  };

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

  useEffect(() => {
    generateRDFContent();
  }, [entities, connectionVocData, ontologies, uriMappings, uriPrefix, vocabularyTables, vocabularyData]);

  const parseRDFContent = (rdfContent) => {
    const lines = rdfContent.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => {
      const [subject, predicate, ...objectParts] = line.split(' ');
      const object = objectParts.join(' ');
      return { subject, predicate, object };
    });
  };

  const triples = parseRDFContent(rdfContent);

  return (
    <div>
      <h1>Knowledge Graph</h1>
      <DownloadRDF generateRDFContent={generateRDFContent} />
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
  );
};

export default KnowledgeGraph;
