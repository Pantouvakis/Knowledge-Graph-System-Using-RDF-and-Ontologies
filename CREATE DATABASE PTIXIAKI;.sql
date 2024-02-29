CREATE DATABASE PTIXIAKI;

CREATE TABLE GeneralProperties(
  title VARCHAR(255),
  subtitle VARCHAR(255),
  descript text,
  UriPrefix VARCHAR(255)
);

CREATE TABLE DataTypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    varchar_column VARCHAR(255),
    char_column CHAR(10),
    int_column INT,
    tinyint_column TINYINT,
    smallint_column SMALLINT,
    bigint_column BIGINT,
    decimal_column DECIMAL(10,2),
    float_column FLOAT,
    double_column DOUBLE,
    date_column DATE,
    datetime_column DATETIME,
    timestamp_column TIMESTAMP,
    time_column TIME,
    year_column YEAR,
    text_column TEXT,
    blob_column BLOB
);