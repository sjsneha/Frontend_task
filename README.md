# Workindia_task
Node.js application using the Express framework for building a web API. This API includes functionality for user registration, login, creating matches, getting match schedules, getting match details, adding players to teams, and getting player statistics. Additionally, it uses JWT (JSON Web Tokens) for authentication and a MySQL database for storing data.

The config.js file you've provided contains the configuration settings for your application, including database connection details and a JWT secret key.

## Introduction

This project was created as part of a task for Work India. It's a simple web application built using Node and Express that displays boxes by fetching data from the given API

## Implementation Details
Express.js Framework: Used the Express.js framework to build a web server, handle HTTP requests, and define API routes.
Database Integration:  connects to a MySQL database for data storage.
User Registration and Authentication:
Users can register using the /register POST route. User information (username, password, email) is received in the request body.
Match Management:
Matches can be created by administrators using the /matches POST route.
Team and Player Management:
Players can be added to teams by administrators using the /teams/:teamId/players POST route.
JWT Authentication Middleware:
Middleware function authenticateToken is used to protect certain routes (e.g., match creation and player addition routes) with JWT authentication.
Server Configuration and Start:
The server listens on a specified port (defaulting to 3000 or using the process.env.PORT variable).
Security Considerations:
Sensitive information such as database credentials and JWT secret keys are stored in a separate configuration file (config.js) and should be kept secure.
Validation and Error Handling:
There are basic validation checks for required fields in request bodies.
Room for Improvement:
In a production environment, additional security measures, input validation, and error handling improvements should be considered.

## Screenshot of Website
![image](https://github.com/sjsneha/Workindia_task/assets/77097698/4dd550b5-e51f-46ef-8292-ca71f13c2f4b)

![image](https://github.com/sjsneha/Workindia_task/assets/77097698/5cce21b4-1519-4c4d-8180-2b905278ac08)

![image](https://github.com/sjsneha/Workindia_task/assets/77097698/e7178b50-ca67-4d19-b48b-a488aa48de13)

![image](https://github.com/sjsneha/Workindia_task/assets/77097698/fb1ef09f-42b4-410d-b8fb-c25c7282c9a4)





