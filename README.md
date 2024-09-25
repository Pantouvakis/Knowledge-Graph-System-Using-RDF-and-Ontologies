## Brief Description

**Technologies Used**

1.React
React is employed for the frontend development of the application. It provides a dynamic and interactive user interface, allowing users to interact with the system seamlessly. Its component-based architecture ensures a modular, scalable design and improves the maintainability of the user interface. Through React, users can easily configure data, upload ontologies, and view knowledge graphs in real time.

2.Node.js and Express
The backend of the application is built using Node.js, a fast and efficient JavaScript runtime. Express, a minimal and flexible Node.js web framework, handles the server-side logic and API endpoints. Together, these technologies manage data flow between the frontend and backend, handle user requests, and provide a robust and scalable foundation for the application.

3.RDF (Resource Description Framework)
RDF is used to represent and store structured data in a machine-readable format. This framework allows for the efficient organization and retrieval of information, particularly with ontologies. By using RDF, the system can manage complex data relationships and extract knowledge graphs, facilitating semantic querying and advanced data visualization.

**What the System Can Do**

Interactive User Interface:
With React, users can configure and manage their data through a simple and responsive interface, allowing easy updates to ontology properties and real-time feedback on their actions.

Efficient Backend for Data Management:
Node.js and Express power the backend, managing requests and ensuring fast communication between the frontend and the RDF-based data storage. Users can perform CRUD (Create, Read, Update, Delete) operations on ontology properties efficiently.

Ontology-Based Data Representation:
RDF enables the system to structure and manage data in a semantic way, improving data retrieval and allowing for meaningful connections between different entities in the system.

Knowledge Graph Extraction:
The system can generate knowledge graphs based on the stored RDF data, allowing users to visualize and explore complex relationships between different data points.


## Setup

Database:
To use the application, you need to install and configure MySQL workbench as the database to store data.

1.Download MySQL
You can download MySQL from the official MySQL website:
https://dev.mysql.com/downloads/

2.Install MySQL
Follow the installation instructions for your operating system. During installation:

Set a root password (you will need this later).
Choose a default port (typically 3306).
Enable MySQL to start automatically if desired.

3.Create a Database and User
After installing MySQL, follow these steps to set up the required database and user:
-Open the MySQL command-line client or a MySQL GUI tool (such as MySQL Workbench).
-Log in as the root user:

    mysql -u root -p
-Create the Database:

    CREATE DATABASE ptixiaki;
-Create a new user:

    CREATE USER 'your_username'@'localhost' IDENTIFIED BY 'your_password';
    GRANT ALL PRIVILEGES ON ptixiaki.* TO 'your_username'@'localhost';
    FLUSH PRIVILEGES;
You will find this part later in the backend in the file "server.js" so save the credentials

    const connection = mysql.createConnection({
    host: 'localhost',
    user: 'your_username',  // Replace with your MySQL username
    password: 'your_password',  // Replace with your MySQL password
    database: 'ptixiaki'
    });
Prerequisites
To use the application, ensure that the following software is installed on your system:

Node.js (v12 or higher)
You can download Node.js from the official site: https://nodejs.org/

npm (comes bundled with Node.js)

Steps to Set Up the Project
Clone the Repository First, clone the project from the repository https://github.com/Pantouvakis/Thesis

    git clone https://github.com/Pantouvakis/Thesis
Navigate to the Project Directory Open a terminal or command prompt and navigate to the folder where the project was cloned:

    cd Thesis
Install Dependencies After navigating to the project directory, install all the necessary dependencies by running:

    npm install
This will install all required Node.js packages for both the backend and frontend (if they are combined in the same project).

Start the Backend Server The backend server is built using Node.js and Express. To start the server, run:

    node server.js
Start the Frontend (React) To run the React frontend application, navigate to the frontend directory (if separate) and start the React development server:

    npm start
This will launch the frontend on http://localhost:3000 by default, but ensure that it corresponds with the backend port if configured differently.

Running the Application
Once the setup is complete, both the backend and frontend servers should be running:

Frontend will be available at http://localhost:3000


## System Requirements

Operating System: Windows, macOS, or Linux

RAM: At least 4 GB

Processor: Any modern dual-core processor or better

Node.js Version: v12 or higher

Browser: Latest version of Chrome, Firefox, or any modern browser
