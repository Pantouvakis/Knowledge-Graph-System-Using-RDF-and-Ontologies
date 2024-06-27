export const getOntologyTriples = (subject, ontologies) => {
  return ontologies
    .filter(ontology => ontology.Property_Name && ontology.Property_Value && ontology.Property_Name.trim() !== "" && ontology.Property_Value.trim() !== "")
    .map(ontology => {
      const secondaryPredicate = `<${ontology.Property_Name}>`;
      const secondaryObject = ontology.Property_Value.startsWith('http')
        ? `<${ontology.Property_Value}>`
        : `"${ontology.Property_Value}"`;
      return `${subject} ${secondaryPredicate} ${secondaryObject} .\n`;
    })
    .join('');
};

export const generateUri = (prefix, tableName, id) => `${prefix}${tableName.toLowerCase()}/${id}`;

export const getPredicateUri = (property, tableN, uriMappings) => {
  const mapping = uriMappings.find(mapping => mapping.columnN === property && mapping.tableN === tableN);
  return mapping ? mapping.ontologyProperty : property;
};

export const getConnection = (tableName, tableC, connectionVocData) => connectionVocData.find(conn => conn.tableN === tableName && conn.tableC === tableC);

export const getOntologyClass = (category, ontologies) => {
  const ontology = ontologies.find(ont => ont.category.toLowerCase() === category.toLowerCase());
  return ontology ? ontology.Ontology_Class : null;
};

export const getRdfTypeObject = (value, connection, uriPrefix) => {
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
      return typeof value === 'string' && value.startsWith('http')
        ? `<${value}>`
        : `"${value}"`;
    } else if (connection.vocT === "Latitude" || connection.vocT === "Longitude") {
      return typeof value === 'string' && value.startsWith('http')
        ? `<${value}>`
        : `"${String(value).replace(".", "")}"`;
    } else {
      return typeof value === 'string' && value.startsWith('http')
        ? `<${value}>`
        : `"${value}"^^<http://www.w3.org/2001/XMLSchema#${type}>`;
    }
  } else if (connection.vocS === 1 || connection.vocS === 2) {
    return `<${uriPrefix}${connection.vocT}/${value}>`;
  }
  return `"${value}"`;
};
