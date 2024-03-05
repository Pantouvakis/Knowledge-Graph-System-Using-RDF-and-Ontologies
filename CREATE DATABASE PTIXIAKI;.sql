CREATE DATABASE PTIXIAKI;

CREATE TABLE GeneralProperties(
  title VARCHAR(255),
  subtitle VARCHAR(255),
  descript text,
  UriPrefix VARCHAR(255)
);

CREATE TABLE vocabulary (
  text_column TEXT,
  varchar_column VARCHAR(255),
  int_column INT,
  date_column DATE,
  datetime_column DATETIME,
  timestamp_column TIMESTAMP,
  time_column TIME,
  year_column YEAR,
  blob_column BLOB
);

CREATE TABLE dataTypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    typeName VARCHAR(50) NOT NULL
);

INSERT INTO dataTypes (typeName) VALUES
    ('VARCHAR'),
    ('INT'),
    ('FLOAT'),
    ('DECIMAL'),
    ('TIMESTAMP'),
    ('TIME'),
    ('YEAR'),
    ('DATETIME');

CREATE TABLE UploadedFiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fileName VARCHAR(255) NOT NULL,
    fileSize INT NOT NULL,
    mimeType VARCHAR(100) NOT NULL,
    filePath VARCHAR(255) NOT NULL
);