CREATE DATABASE PTIXIAKI;

USE PTIXIAKI;

CREATE TABLE GeneralProperties(
  ID INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  descript text,
  UriPrefix VARCHAR(255)
);

CREATE TABLE ontologies(
    category VARCHAR(255),
    Ontology_Class VARCHAR(255),
    Property_Name VARCHAR(255),
    Property_Value VARCHAR(255)
);

CREATE TABLE dataTypes (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    typeName VARCHAR(50) NOT NULL
);

INSERT INTO dataTypes (typeName) VALUES
    ('VARCHAR(255)'),
    ('TEXT'),
    ('INT'),
    ('YEAR'),
    ('DATE'),
    ('TIME'),
    ('DATETIME'),
    ('Latitude'),
    ('Longitude'),
    ('BLOB');


CREATE TABLE UploadedFiles (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    fileName VARCHAR(255) NOT NULL,
    fileSize INT NOT NULL,
    mimeType VARCHAR(100) NOT NULL,
    filePath VARCHAR(255) NOT NULL
);

CREATE DATABASE vocabulary;

USE vocabulary; 