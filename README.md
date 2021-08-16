# Movies App

## Description
A REST API that provides data about different movies, like directors, genre, description, data about the directors etc.
The app is hosted on [Heroku](https://www.heroku.com/home) connects to a MongoDB database.
It uses [Passport](http://www.passportjs.org/) for authorization / authentication and the endpoints are only accessible if a user is registered and authorized.
To see all the endpoints check the [documentation](https://myflix-app-1029.herokuapp.com/documentation.html).

## Technologies
  * Node.js
  * Express
  * Mongoose
  * Passport

## Web services
* Atlas MongoDB - database
* Heroku - codebase

## Dependencies

    "dependencies": {
    "bcrypt": "^5.0.1",
    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "express-validator": "^6.11.1",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^5.12.11",
    "morgan": "^1.10.0",
    "passport": "^0.4.1",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0",
    "uuid": "^8.3.2"
  }


