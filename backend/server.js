const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rooter',
  database: 'ptixiaki'
});





app.post("/create-table", (req, res) => {
  const { tableName } = req.body;
  
  // First, execute the CREATE TABLE query
  const createTableSql = `CREATE TABLE ${tableName} (
    ID INT AUTO_INCREMENT PRIMARY KEY)`;
    
  connection.query(createTableSql, (createError, createResults, createFields) => {
    if (createError) {
      console.error('Error creating table:', createError);
      res.status(500).json({ error: 'Error creating table' });
      return;
    }
    
    // If the table creation was successful, execute the INSERT query
    const insertOntologySql = `INSERT INTO ontologies (category, Ontology_Class, Property_Name, Property_Value)
      VALUES ('${tableName}', '', '', '')`;
      
    connection.query(insertOntologySql, (insertError, insertResults, insertFields) => {
      if (insertError) {
        console.error('Error inserting into ontologies:', insertError);
        res.status(500).json({ error: 'Error inserting into ontologies' });
        return;
      }
      
      console.log(`Table ${tableName} created successfully and inserted into ontologies.`);
      res.json({ message: `Table ${tableName} created successfully and inserted into ontologies.` });
    });
  });
});
app.post("/delete-table", (req, res) => {
  const { tableName } = req.body;

  // SQL query to drop the table
  const dropTableSql = `DROP TABLE ${tableName}`;

  // Execute the drop table query
  connection.query(dropTableSql, (error) => {
      if (error) {
          console.error('Error deleting table:', error);
          res.status(500).json({ error: 'Error deleting table' });
          return;
      }

      console.log(`Table ${tableName} deleted successfully.`);

      // SQL query to delete rows from the ontologies table
      const dropOntologysql = `DELETE FROM ontologies WHERE category='${tableName}'`;

      // Execute the delete rows from ontologies table query
      connection.query(dropOntologysql, (error) => {
          if (error) {
              console.error('Error deleting rows from ontologies:', error);
              res.status(500).json({ error: 'Error deleting rows from ontologies' });
              return;
          }

          console.log(`Rows with category ${tableName} deleted from ontologies successfully.`);

          // SQL query to delete rows from the uriontologies table
          const dropUriontologiesSql = `DELETE FROM uriontologies WHERE tableN = '${tableName}'`;

          // Execute the delete rows from uriontologies table query
          connection.query(dropUriontologiesSql, (error) => {
              if (error) {
                  console.error('Error deleting rows from uriontologies:', error);
                  res.status(500).json({ error: 'Error deleting rows from uriontologies' });
                  return;
              }

              console.log(`Rows with tableN ${tableName} deleted from uriontologies successfully.`);

              // SQL query to delete rows from the connectionvoc table
              const dropConnectionVocSql = `DELETE FROM connectionvoc WHERE tableN = '${tableName}'`;

              // Execute the delete rows from connectionvoc table query
              connection.query(dropConnectionVocSql, (error) => {
                  if (error) {
                      console.error('Error deleting rows from connectionvoc:', error);
                      res.status(500).json({ error: 'Error deleting rows from connectionvoc' });
                      return;
                  }

                  console.log(`Rows with tableN ${tableName} deleted from connectionvoc successfully.`);
                  res.json({ message: `Table ${tableName} and associated rows deleted successfully.` });
              });
          });
      });
  });
});




app.post("/add-column", (req, res) => {
  const { tableName, columnName, columnType, ontologyProperty } = req.body;
  let sql;
  let modifiedColumnType = columnType;
  let flag = 0;
  
  // Parse the columnType to handle specific constraints
  switch (columnType) {
    case 'VARCHAR(255)':
      sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} VARCHAR(255);`;
      break;
    case 'TEXT':
      sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} TEXT;`;
      break;
    case 'INT':
       sql = `ALTER TABLE ${tableName} 
       ADD ${columnName} INT;`;
       break;
    case 'YEAR':
      sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} ${columnType}(4) CHECK (${columnName} >= 1001 AND ${columnName} <= 2155);`;
      break;
    case 'DATE':
      sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} DATE;`;
      break;
    case 'TIME':
      sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} TIME;`;
      break;
    case 'DATETIME':
      sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} DATETIME;`;
      break;
    case 'Latitude':
      sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} DOUBLE;`;
      break;
    case 'Longitude':
      sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} DOUBLE;`;
      break;
    case 'BLOB':
      sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} BLOB;`;
      break;
    default:
      if (/ Vocab$/.test(columnType)) {
         modifiedColumnType = columnType.substring(0, columnType.length - 6);
        sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} VARCHAR(255),
      ADD CONSTRAINT FK_${columnName} FOREIGN KEY (${columnName})
      REFERENCES vocabulary.${modifiedColumnType}(name);`;
      flag=1;
      break;
    } else {
      sql = `ALTER TABLE ${tableName}
      ADD ${columnName} INT,
      ADD CONSTRAINT FK_${columnName} FOREIGN KEY (${columnName})
      REFERENCES ptixiaki.${columnType}(ID);`;
      flag=2;
      break;
    }
      
  }
  connection.query(sql, (error, results, fields) => {
      if (error) {
          console.error('Error adding column:', error);
          res.status(500).json({ error: 'Error adding column' });
          return;
      }

      // After the column being added, insert into uriontologies
      const insertSql = `INSERT INTO uriontologies (\`tableN\`, \`columnN\`, \`ontologyProperty\`) 
                          VALUES ('${tableName}','${columnName}', '${ontologyProperty}')`;

      connection.query(insertSql, (insertError, insertResults, insertFields) => {
          if (insertError) {
              console.error('Error inserting data:', insertError);
              res.status(500).json({ error: 'Error inserting data' });
              return;
          }

          console.log(`Data inserted into column ${columnName} of table ${tableName} successfully.`);
          
          if (flag === 1 || flag === 2) {
              let sqlconnect;
              if (flag === 1) {
                  sqlconnect = `INSERT INTO connectionvoc (vocS, tableC, tableN, vocT)
                                  VALUES (1, '${columnName}', '${tableName}', '${modifiedColumnType}')`;
              } else {
                  sqlconnect = `INSERT INTO connectionvoc (vocS, tableC, tableN, vocT)
                                  VALUES (2, '${columnName}', '${tableName}', '${columnType}')`;
              }
              connection.query(sqlconnect, (insError) => {
                  if (insError) {
                      console.error('Error inserting the connection:', insError);
                      res.status(500).json({ error: 'Error inserting data' });
                      return;
                  }
                  
                  console.log(`Data inserted into connectionvoc successfully.`);
                  res.json({ message: `Column ${columnName} added to table ${tableName} and data inserted successfully.` });
              });
          } else if (flag === 0) {
              const sql3 = `INSERT INTO connectionvoc (tableC, tableN, vocT)
                          VALUES ('${columnName}', '${tableName}', '${columnType}')`;

              connection.query(sql3, (error) => {
                  if (error) {
                      console.error('Error adding column:', error);
                      res.status(500).json({ error: 'Error adding column' });
                      return;
                  }
                  console.log('def');
                  res.json({ message: `success` });
              });
          }
      });
  });
});
app.post("/delete-column", (req, res) => {
  const { tableName, columnName } = req.body;
  const sql = `ALTER TABLE ${tableName} DROP COLUMN ${columnName};`;

  connection.query(sql, (error, results, fields) => {
      if (error) {
          const dropForeignKeySql = `ALTER TABLE ${tableName} DROP FOREIGN KEY FK_${columnName};`;
          connection.query(dropForeignKeySql, (dropError, dropResults, dropFields) => {
              if (dropError) {
                  console.error('Error dropping foreign key constraint:', dropError);
                  res.status(500).json({ error: 'Error dropping foreign key constraint' });
                  return;
              }
              console.log('Foreign key constraint dropped successfully.');

              const dropColumnSql = `ALTER TABLE ${tableName} DROP COLUMN ${columnName};`;
              connection.query(dropColumnSql, (dropColumnError, dropColumnResults, dropColumnFields) => {
                  if (dropColumnError) {
                      console.error('Error dropping column:', dropColumnError);
                      res.status(500).json({ error: 'Error dropping column' });
                      return;
                  }
                  console.log(`Column ${columnName} deleted from table ${tableName} successfully after dropping foreign key constraint.`);

                  // After dropping the column and its foreign key constraint, you can proceed with deleting associated data
                  const deletesql = `DELETE FROM uriontologies WHERE columnN = '${columnName}';`;
                  connection.query(deletesql, (deleteError, deleteResults, deleteFields) => {
                      if (deleteError) {
                          console.error('Error deleting data:', deleteError);
                          res.status(500).json({ error: 'Error deleting data' });
                          return;
                      }

                      // Now proceed with deleting associated data from connectionvoc table
                      const deletesql2 = `DELETE FROM connectionvoc WHERE tableN = '${tableName}' AND tableC = '${columnName}';`;
                      connection.query(deletesql2, (deleteError2, deleteResults2, deleteFields2) => {
                          if (deleteError2) {
                              console.error('Error deleting data:', deleteError2);
                              res.status(500).json({ error: 'Error deleting data 2' });
                              return;
                          }

                          // If all operations were successful, send the response
                          res.json({ message: `Column ${columnName} deleted from table ${tableName} successfully.` });
                      });
                  });
              });
          });

          return;
      }

      const deleteUrisql = `DELETE FROM uriontologies WHERE columnN = '${columnName}';`;
      connection.query(deleteUrisql, (deleteError, deleteResults, deleteFields) => {
          if (deleteError) {
              console.error('Error deleting data:', deleteError);
              res.status(500).json({ error: 'Error deleting data' });
              return;
          }

          // Now proceed with deleting associated data from connectionvoc table
          const deletesql2 = `DELETE FROM connectionvoc WHERE tableN = '${tableName}' AND tableC = '${columnName}';`;
          connection.query(deletesql2, (deleteError2, deleteResults2, deleteFields2) => {
              if (deleteError2) {
                  console.error('Error deleting data:', deleteError2);
                  res.status(500).json({ error: 'Error deleting data 2' });
                  return;
              }

              console.log(`Column ${columnName} deleted from table ${tableName} successfully.`);
              
              // Send response indicating successful deletion
              res.json({ message: `Column ${columnName} deleted from table ${tableName} successfully.` });
          });
      });
  });
});



app.get("/get-connectionvoc/:tableName", (req, res) => {
  const { tableName } = req.params;

  const sqlQuery = `
    SELECT *
    FROM ptixiaki.connectionvoc
    WHERE tableN = ?`;

  connection.query(sqlQuery, [tableName], (error, results) => {
    if (error) {
      console.error('Error executing query: ' + error.stack);
      res.status(500).json({ error: 'Error executing query' });
      return;
    }
    res.json(results);
  });
});





app.post("/read-data", (req, res) => {
  const { tableName } = req.body;
  const sql = `SELECT * FROM ${tableName};`;

  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error reading data:', error);
      res.status(500).json({ error: 'Error reading data' });
      return;
    }

    //console.log(`Data from table ${tableName} retrieved successfully.`);
    res.json({ data: results });
  });
});
//Insert In Configuration General Properties
app.post("/insert-general-properties", (req, res) => {
  const { data } = req.body;
  const { column1, column2, column3, column4 } = data;
  const sql = `INSERT INTO generalproperties (title, subtitle, descript, UriPrefix) VALUES (?, ?, ?, ?)`;
  const values = [column1, column2, column3, column4];
  connection.query(sql, values, (error, results, fields) => {
    if (error) {
      console.error('Error inserting data into GeneralProperties:', error);
      return res.status(500).json({ error: 'Error inserting data into GeneralProperties' });
    }
    console.log('Data inserted into GeneralProperties successfully.');
    return res.json({ message: 'Data inserted into GeneralProperties successfully.' });
  });
});
//Get Tables expect generalproperties and users
app.get('/get-tables', (req, res) => {
  connection.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'ptixiaki'
      AND table_name NOT IN ('generalproperties', 'connectionvoc', 'datatypes', 'uploadedfiles', 'ontologies', 'uriontologies')
    ORDER BY table_name;
  `, (err, results) => {
    if (err) {
      console.error('Error retrieving tables:', err);
      res.status(500).json({ error: 'Error retrieving tables' });
    } else {
      const tables = results.map(row => row.TABLE_NAME);
      res.json({ tables });
    }
  });
});
//Get Columns From a Table
app.get("/get-columns/:tableName", (req, res) => {
  const { tableName } = req.params;
  const sql = `SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'ptixiaki'
    AND table_name = '${tableName}'
    ORDER BY ORDINAL_POSITION;`;

  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error creating table:', error);
      res.status(500).json({ error: 'Error creating table' });
      return;
    }
    const columns=results.map(row=>({
      name: row.COLUMN_NAME,
      dataType: row.DATA_TYPE
    }));
    res.json({ columns });
  });
});
app.get("/get-row-insertions/:tableName/:ID", (req, res) => {
  const { tableName, ID } = req.params;
  
  const sql = `SELECT * FROM ptixiaki.?? WHERE ID = ?`;

  connection.query(sql, [tableName, ID], (error, results, fields) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }
    const columns = fields.map(field => ({
      name: field.name
    }));
    res.json({ data: results });
  });
});

//Insert data inside tables in Documentation
app.post('/insert-data', async (req, res) => {
  const { tableName, columns, values } = req.body;
  try {
    const newValues = values.map(value => value === '' ? null : value);
    let sql;
    if (newValues.length > 0) {
      const placeholders = newValues.map(() => '?').join(', ');
      sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    } else {
      sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ()`; // No values to insert
    }
    console.log(sql, "     ",newValues);
    connection.query(sql, newValues, (error, result) => {
      if (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ success: false, error: 'Error inserting data', message: error.message });
        return;
      }
      console.log('Data inserted successfully:', result);
      res.json({ success: true, message: 'Data inserted successfully', result });
    });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ success: false, error: 'Error inserting data', message: error.message });
  }
});



app.delete('/delete2-row/:tableName/:rowId', async (req, res) => {
  const { tableName, rowId } = req.params;

  try {
    const sql = `DELETE FROM ptixiaki.${tableName} WHERE ID = ${rowId}`;
    
    connection.query(sql, (error, result) => {
      if (error) {
        console.error('Error deleting row:', error);
        res.status(500).json({ success: false, error: 'Error deleting row', message: error.message });
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).json({ success: false, error: 'Row not found', message: 'No row with the provided ID was found' });
        return;
      }

      console.log('Row deleted successfully');
      res.json({ success: true, message: 'Row deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting row:', error);
    res.status(500).json({ success: false, error: 'Error deleting row', message: error.message });
  }
});

app.get('/get-data/:tableName', (req, res) => {
  const { tableName } = req.params;
  const sql = `SELECT * FROM ${tableName}`;

  connection.query(sql, (error, results) => {
    if (error) {
      console.error(`Error fetching data for table ${tableName}:`, error);
      res.status(500).json({ error: `Error fetching data for table ${tableName}` });
    } else {
      res.json({ data: results });
    }
  });
});
//Config - Entity Categories - get inputs of datatypes
app.get('/inputs-of-datatypes', (req, res) => {
  const query = 'SELECT typeName FROM datatypes';

  connection.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching inputs:', error);
      res.status(500).json({ error: 'Error fetching inputs' });
      return;
    }

    const inputs = results.map(result => result.typeName);
    res.json(inputs);
  });
});
app.post('/update-data', async (req, res) => {
  const { tableName, newData, id } = req.body;

  try {
    const columns = Object.keys(newData);
    const values = Object.values(newData);

    const setClause = columns.map(column => `${column} = ?`).join(', ');

    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ID = ?`;

    // Execute the UPDATE query with parameterized values
    connection.query(sql, [...values, id], (error, result) => {
      if (error) {
        console.error('Error updating data:', error);
        return res.status(500).json({ error: 'Error updating data', message: error.message });
      }
      console.log(`Data updated in table ${tableName} successfully.`);
      return res.json({ message: `Data updated in table ${tableName} successfully.`, result });
    });
  } catch (error) {
    console.error('Error updating data:', error);
    return res.status(500).json({ error: 'Error updating data', message: error.message });
  }
});



/*/uploading files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Set the file name to be unique
  }
});

const upload = multer({ storage: storage });
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }
  
  // File was uploaded successfully
  res.send('File uploaded successfully: ' + req.file.filename);
});*/





app.post('/read-uriontologies-data/', (req, res) => {
  const { tableName } = req.body;
  const sql = `SELECT * FROM uriontologies
  WHERE tableN = '${tableName}';`;

  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error reading data:', error);
      res.status(500).json({ error: 'Error reading data' });
      return;
    }

    console.log(`URIs for ${tableName} retrieved successfully.`);
    res.json({ data: results });
  });
});
app.post('/update-uri', (req, res) => {
  const { tableN, columnN, ontologyProperty} = req.body;
  const sql = `UPDATE ptixiaki.uriontologies
               SET ontologyProperty = ?
               WHERE tableN = ?
               AND columnN = ?`;

  connection.query(sql, [ontologyProperty, tableN, columnN], (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).json({ success: false, message: 'Error saving ontology properties.' });
      return;
    }
    console.log('URIontologyProperty saved Successfully');
    res.status(200).json({ success: true, message: 'URIontologyProperty saved successfully.' });
  });
});



//read a row from ontologies
app.post('/read-ontologies-data/', (req, res) => {
  const { tableName } = req.body;
  const sql = `SELECT Ontology_Class, Property_Name, Property_Value FROM ontologies
  WHERE category = '${tableName}';`;

  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error reading data:', error);
      res.status(500).json({ error: 'Error reading data' });
      return;
    }

    console.log(`Ontologies for ${tableName} retrieved successfully.`);
    res.json({ data: results });
  });
});
//update ontologies
app.post('/save-ontology-properties', (req, res) => {
  const { selectedTable, ontologyClass, propertyName, propertyValue } = req.body;

  const sql = `UPDATE ptixiaki.ontologies
               SET Ontology_Class = ?,
                   Property_Name = ?,
                   Property_Value = ?
               WHERE category = ?`;

  connection.query(sql, [ontologyClass, propertyName, propertyValue, selectedTable], (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).json({ success: false, message: 'Error saving ontology properties.' });
      return;
    }
    console.log('Ontology properties saved successfully');
    res.status(200).json({ success: true, message: 'Ontology properties saved successfully.' });
  });
});




//Create Vocabulary Table
app.post("/create-vtable", (req, res) => {
  const { tableName } = req.body;
  const sql = 
  `CREATE TABLE vocabulary.${tableName} (
    ID INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  broader VARCHAR(255)
  );`;
connection.query(sql, (error, results, fields) => {
  if (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ error: 'Error creating table' });
    return;
  }
  console.log(`Table ${tableName} created successfully.`);
  res.json({ message: `Table ${tableName} created successfully.` });
});
});
//Insert In Vocabulary
app.post("/insert-vocabulary/:tableName/:value", (req, res) => {
  const { tableName, value } = req.params;

  if (!value) {
    return res.status(400).json({ error: 'Please provide a value to insert.' });
  }

  const sql = `INSERT INTO vocabulary.${tableName} (name) VALUES (?)`;
  connection.query(sql, [value], (error, results, fields) => {
    if (error) {
      console.error('Error inserting data into Vocabulary:', error);
      return res.status(500).json({ error: 'Error inserting data into Vocabulary' });
    }
    const insertedId = results.insertId;

    console.log('Data inserted into Vocabulary successfully.');
    return res.json({ message: 'Data inserted into Vocabulary successfully.', id: insertedId});
  });
});
app.post("/insert-vocabulary2", (req, res) => {
  const { tableName, value, broader } = req.body;

  if (!tableName || !value) {
    return res.status(400).json({ error: 'Please provide tableName, value, and broader in the request body.' });
  }

  const sql = `INSERT INTO vocabulary.${tableName} (name, broader) VALUES (?, ?)`;
  connection.query(sql, [value, broader], (error, results, fields) => {
    if (error) {
      console.error('Error inserting data into Vocabulary:', error);
      return res.status(500).json({ error: 'Error inserting data into Vocabulary' });
    }
    const insertedId = results.insertId;

    console.log('Data inserted into Vocabulary successfully.');
    return res.json({ message: 'Data inserted into Vocabulary successfully.', id: insertedId });
  });
});
//get vocabulary tables
app.get('/get-vtables', (req, res) => {
  connection.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'vocabulary'
    ORDER BY table_name;
  `, (err, results) => {
    if (err) {
      console.error('Error retrieving tables:', err);
      res.status(500).json({ error: 'Error retrieving tables' });
    } else {
      const tables = results.map(row => row.TABLE_NAME);
      res.json({ tables });
    }
  });
});
//delete Vocabulary Table
app.post("/delete-vtable", (req, res) => {
  const { tableName } = req.body;
  const dropTableSql = `DROP TABLE vocabulary.${tableName}`;

  connection.query(dropTableSql, (error, results, fields) => {
    if (error) {
      console.error('Error deleting table:', error);
      res.status(500).json({ error: 'Error deleting table' });
      return;
    }

    console.log(`Table ${tableName} deleted successfully.`);

    // Execute the second query inside the callback of the first query
    const dropOntologysql = `DELETE FROM ontologies WHERE category='${tableName}'`;
    
    connection.query(dropOntologysql, (error, results, fields) => {
      if (error) {
        console.error('Error deleting row:', error);
        res.status(500).json({ error: 'Error deleting row' });
        return;
      }
      
      console.log(`Rows with category ${tableName} deleted from ontologies successfully.`);
      res.json({ message: `Table ${tableName} and associated rows deleted successfully.` });
    });
  });
});
//read vocabulary data
app.post("/read-vdata", (req, res) => {
  const { tableName } = req.body;
  const sql = `SELECT * FROM vocabulary.${tableName};`;

  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error reading data:', error);
      res.status(500).json({ error: 'Error reading data' });
      return;
    }
    res.json({ data: results });
  });
});
app.post("/read-names-vdata", (req, res) => {
  const { tableName } = req.body;
  const sql = `SELECT name FROM vocabulary.${tableName};`; // Selecting only the name column

  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error reading data:', error);
      res.status(500).json({ error: 'Error reading data' });
      return;
    }
    res.json( results );
  });
});

// Edit Vocabulary Rows
app.put('/edit-vocabulary/:tableName/:rowName', (req, res) => {
  const { tableName, rowName } = req.params;
  const { name, broader } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Please provide a value to update.' });
  }

  const sql = broader !== undefined
    ? `UPDATE vocabulary.${tableName} SET name = ?, broader = ? WHERE name = ?`
    : `UPDATE vocabulary.${tableName} SET name = ? WHERE name = ?`;

  const params = broader !== undefined ? [name, broader, rowName] : [name, rowName];

  connection.query(sql, params, (error, result) => {
    if (error) {
      console.error('Error updating data:', error);
      res.status(500).json({ success: false, error: 'Error updating data.' });
    } else {
      res.json({ success: true, message: 'Data updated successfully.', data: result });
      console.log('Row updated');
    }
  });
});
app.post('/save-vocabulary', async (req, res) => {
  const { tableName, rowID, name, broader } = req.body;

  if (!tableName || !rowID || !name) {
    return res.status(400).json({ error: 'Please provide tableName and name in the request body.' });
  }

  try {
    let sql;
    let params;
    if (broader !== undefined) {
      sql = `UPDATE vocabulary.${tableName} SET name = ?, broader = ? WHERE ID = ?`;
      params = [name, broader, rowID];
  } else {
      sql = `UPDATE vocabulary.${tableName} SET name = ? WHERE ID = ?`;
      params = [name, rowID];
  }
    connection.query(sql, params, (error, result) => {
      if (error) {
        console.error('Error updating data:', error);
        return res.status(500).json({ success: false, error: 'Error updating data.' });
      } else {
        console.log('Row updated');
        return res.json({ success: true, message: 'Data updated successfully.', data: result });
      }
    });
  } catch (error) {
    console.error('Error updating data:', error);
    return res.status(500).json({ success: false, error: 'Error updating data.' });
  }
});
app.get('/get-vocinsertion/:tableName/:name', (req, res) => {
  const { tableName, name } = req.params;

  const sql = `SELECT name FROM vocabulary.?? WHERE name = ?`;

  connection.query(sql, [tableName, name], (error, result) => {
    if (error) {
      console.error(`Error fetching data for table ${tableName}:`, error);
      res.status(500).json({ error: `Error fetching data for table ${tableName}` });
    } else {
      if (result.length > 0) {
        res.json(result[0].name);
      } else {
        res.status(404).json({ error: 'No data found' });
      }
    }
  });
});
app.delete('/delete-row/:tableName/:name', async (req, res) => {
  const { tableName, name } = req.params;

  try {
    const sql = `DELETE FROM vocabulary.${tableName} WHERE name = '${name}'`;
    
    connection.query(sql, (error, result) => {
      if (error) {
        console.error('Error deleting row:', error);
        res.status(500).json({ success: false, error: 'Error deleting row', message: error.message });
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).json({ success: false, error: 'Row not found', message: 'No row with the provided name was found' });
        return;
      }

      console.log('Row deleted successfully');
      res.json({ success: true, message: 'Row deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting row:', error);
    res.status(500).json({ success: false, error: 'Error deleting row', message: error.message });
  }
});





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});