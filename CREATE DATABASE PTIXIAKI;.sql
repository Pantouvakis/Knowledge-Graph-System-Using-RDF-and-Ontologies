CREATE DATABASE PTIXIAKI;

USE PTIXIAKI;

CREATE TABLE GeneralProperties(
  title VARCHAR(255),
  subtitle VARCHAR(255),
  descript text,
  UriPrefix VARCHAR(255)
);

CREATE TABLE dataTypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    id INT AUTO_INCREMENT PRIMARY KEY,
    fileName VARCHAR(255) NOT NULL,
    fileSize INT NOT NULL,
    mimeType VARCHAR(100) NOT NULL,
    filePath VARCHAR(255) NOT NULL
);