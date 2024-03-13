/*
  git add .
  git commit -m "name"
  git push

html editor (bold)
https://www.youtube.com/watch?v=f55qeKGgB_M&t=5819s&ab_channel=PedroTech
1:37*/
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mysql = require('mysql2'); // Require mysql module

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Create a connection to your database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rooter',
  database: 'ptixiaki'
});
//Config - Create New Entity
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


//Config - Entity Categories
app.post("/delete-table", (req, res) => {
  const { tableName } = req.body;
  const dropTableSql = `DROP TABLE ${tableName}`;

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

//Config - Entity Categories
app.post("/add-column", (req, res) => {
  const { tableName, columnName, columnType } = req.body;
  let sql;

  // Parse the columnType to handle specific constraints
  switch (columnType) {
    case 'TEXT':
      sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} TEXT;`;
      break;
    case 'INT':
       sql = `ALTER TABLE ${tableName} 
       ADD ${columnName} INT;`;
       break;
    case 'YEAR'://set range of year
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
      sql = `ALTER TABLE ${tableName} 
      ADD ${columnName} VARCHAR(255);`;
      break;
  }
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error adding column:', error);
      res.status(500).json({ error: 'Error adding column' });
      return;
    }
    console.log(`Column ${columnName} added to table ${tableName} successfully.`);
    res.json({ message: `Column ${columnName} added to table ${tableName} successfully.` });
  });
});
//Config - Entity
app.post("/delete-column", (req, res) => {
  const { tableName, columnName } = req.body;
  const sql = `ALTER TABLE ${tableName} DROP COLUMN ${columnName};`;
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error deleting column:', error);
      res.status(500).json({ error: 'Error deleting column' });
      return;
    }
    console.log(`Column ${columnName} deleted from table ${tableName} successfully.`);
    res.json({ message: `Column ${columnName} deleted from table ${tableName} successfully.` });
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

    console.log(`Data from table ${tableName} retrieved successfully.`);
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
      AND table_name NOT IN ('generalproperties', 'datatypes', 'uploadedfiles')
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
//Insert data inside tables in Documentation
app.post('/insert-data', async (req, res) => {
  const { tableName, columns, values } = req.body;

  try {
    const newColumns = columns.slice(1);
    const newValues = values.slice(1).map(value => value === '' ? null : value);;

    let sql;
    if (newValues.length > 0) {
      const placeholders = newValues.map(() => '?').join(', ');
      sql = `INSERT INTO ${tableName} (${newColumns.join(', ')}) VALUES (${placeholders})`;
    } else {
      sql = `INSERT INTO ${tableName} (${newColumns.join(', ')}) VALUES ()`; // No values to insert
    }

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

app.delete('/delete-row/:tableName/:rowId', async (req, res) => {
  const { tableName, rowId } = req.params;

  try {
    const sql = `DELETE FROM ${tableName} WHERE ID = ${rowId}`; // Assuming the primary key of your table is named 'id'
    
    connection.query(sql, [rowId], (error, result) => {
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
app.post("/update-data", (req, res) => {
  const { tableName, newData, condition } = req.body;

  const setClause = Object.entries(newData).map(([key, value]) => `${key} = ${mysql.escape(value)}`).join(', ');
  const conditionClause = Object.entries(condition).map(([key, value]) => `${key} = ${mysql.escape(value)}`).join(' AND ');
  const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${conditionClause};`;

  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'Error updating data' });
      return;
    }

    console.log(`Data updated in table ${tableName} successfully.`);
    res.json({ message: `Data updated in table ${tableName} successfully.` });
  });
});

//uploading files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Set the file name to be unique
  }
});

const upload = multer({ storage: storage });

// Define a route for handling file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }
  
  // File was uploaded successfully
  res.send('File uploaded successfully: ' + req.file.filename);
});

//Config - Create Vocabulary Table
app.post("/create-vtable", (req, res) => {
  const { tableName } = req.body;
  const sql = 
  `CREATE TABLE vocabulary.${tableName} (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255)
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
  const sql = `INSERT INTO vocabulary.${tableName} (name) VALUES (${value})`;
  connection.query(sql, values, (error, results, fields) => {
    if (error) {
      console.error('Error inserting data into Vocabulary:', error);
      return res.status(500).json({ error: 'Error inserting data into Vocabulary' });
    }
    console.log('Data inserted into Vocabulary successfully.');
    return res.json({ message: 'Data inserted into Vocabulary successfully.' });
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

    console.log(`Data from table ${tableName} retrieved successfully.`);
    res.json({ data: results });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});