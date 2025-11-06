# KGH - Database Management System for Cooling Systems and Devices

## Overview

KGH is a robust and scalable database management system specifically designed for cooling systems and devices. It provides a comprehensive solution for organizing and managing data related to cooling systems, enabling users to monitor and control their devices efficiently.

## Features

- **Cooling System Management**: The system offers CRUD (Create, Read, Update, Delete) operations for managing cooling systems. Users can create new systems, update their information, retrieve system details, and delete systems as needed.

- **Device Management**: Users can add cooling devices to the system and associate them with specific cooling systems. Device information such as type, model, and serial number can be stored and managed through the system.

- **Data Visualization**: The system incorporates data visualization techniques to present information collected from cooling systems and devices in a visually appealing manner. Graphs and charts are employed to help users analyze trends, identify patterns, and make informed decisions regarding maintenance and efficiency.

- **User Management**: The system supports multiple user accounts with customizable access levels. Administrators can manage user permissions and control access to various system features, ensuring data security and integrity.

## Technologies and Architecture

KGH utilizes the following technologies and follows a specific architecture:

- **CQRS (Command Query Responsibility Segregation)**: The project adopts the CQRS pattern, which segregates the read and write operations. This approach enhances performance, scalability, and maintainability by decoupling the components responsible for handling commands (writes) and queries (reads).

- **Folder Structure**:
  - **KGH(WebUI)**: This folder contains the web user interface of the application, developed using the ReactJS framework. It provides a highly interactive and responsive interface for users to interact with the database management system.
  - **Application**: The application layer resides in this folder and encompasses the business logic and coordination of data flow between the user interface and the domain layer.
  - **Domain**: The domain layer, located in this folder, encapsulates the core business entities, services, and logic. It defines the fundamental concepts and rules related to cooling systems and devices.
  - **Infrastructure**: The infrastructure layer, found in this folder, handles the integration with external systems and services. It includes components for data access, API integrations, and other infrastructure-related code.

- **WebUI**: The user interface is built using the ReactJS template, which offers a modern and responsive front-end framework. It leverages various libraries and components to facilitate seamless interaction between users and the database management system.

- **.NET 7 Microsoft Template**: The backend of the application is developed using the .NET 7 Microsoft template. This template provides a solid foundation for building robust and scalable applications. It incorporates features such as dependency injection, logging, and configuration management to streamline development and enhance application stability.

## Installation

To install and run the KGH project locally, follow these steps:

1. Clone the project repository from [GitHub Repository URL].
2. Install the necessary dependencies for the backend by navigating to the project root directory and running the appropriate package manager command. For example, if using npm:

```shell
cd KGH
dotnet restore
```

3. Configure the database connection and other settings in the application configuration files. Update the connection string and any other relevant configuration options.
4. Build and run the backend API using the .NET CLI:

```shell
dotnet build
dotnet run
```

5. Install the necessary dependencies for the web user interface by navigating to the `

KGH(WebUI)` directory and running the package manager command. For example, if using npm:

```shell
cd KGH/WebUI
npm install
```

6. Build and run the web user interface:

```shell
npm start
```

7. Access the application through your web browser at the specified URL.

## Deployment with Docker

To deploy the DLP project using Docker, follow these steps:

1. Install Docker on your machine by following the official Docker documentation for your operating system.

2. Clone the project repository from [GitHub Repository URL].

3. Build the Docker image by navigating to the project root directory and running the following command:

```shell
docker build -t dlp-app .
```

4. Run the Docker container using the following command:

```shell
docker run -p 8080:8080 dlp-app
```

5. Access the application through your web browser at `http://localhost:8080`.

## Migrations

If you are using Package Manager Console within VS select `DLP.Infrastructure` as default project then run following steps

Windows: 
1. `cd DLP.Infrastructure` 
2. `dotnet ef migrations add -s ..\DLP\ CommitName --context AppDbContext --verbose`
3. `dotnet ef database update -s ..\DLP\ -c AppDBContext -v`
4. `dotnet ef migrations remove -s ..\DLP\ -c AppDBContext -v`

Mac OS: 
1. `cd DLP.Infrastructure` 
2. `dotnet ef migrations add -s ../DLP/ CommitName --context AppDbContext --verbose`
3. `dotnet ef database update -s ../DLP/ -c AppDBContext -v`

## Contributing

Contributions to the DLP project are welcome. If you would like to contribute, please follow these guidelines:

1. Fork the repository and create a new branch for your feature or bug fix.
2. Make your changes, adhering to the project's coding style and best practices.
3. Write comprehensive tests to ensure the stability and correctness of your code.
4. Submit a pull request, clearly describing the changes you've made and the problem they solve.

## License

PRIVATE!
