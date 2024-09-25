USE PTIXIAKI;

CREATE TABLE GeneralProperties(
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

CREATE TABLE uriOntologies(
    tableN VARCHAR(255),
    columnN VARCHAR(255),
    ontologyProperty VARCHAR(255)
);

CREATE TABLE dataTypes (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    typeName VARCHAR(50) NOT NULL
);

INSERT INTO dataTypes (typeName) VALUES
    ('Text'),
    ('Long text'),
    ('Whole number'),
    ('Decimal number'),
    ('Year'),
    ('Date'),
    ('Time'),
    ('Datetime'),
    ('Latitude'),
    ('Longitude');


CREATE TABLE UploadedFiles (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    fileName VARCHAR(255) NOT NULL,
    fileSize INT NOT NULL,
    mimeType VARCHAR(100) NOT NULL,
    filePath VARCHAR(255) NOT NULL
);

CREATE TABLE connectionvoc (
	vocS INT DEFAULT 0,
    vocT VARCHAR(255),
    tableN VARCHAR(255),
    tableC VARCHAR(255)    
);

CREATE DATABASE vocabulary;
