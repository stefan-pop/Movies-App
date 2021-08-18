/**
 * @module app
 */

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const PORT = process.env.PORT || 8080;


const Users = Models.User;
const Movies = Models.Movie;

      //Mongoose connection
// mongoose.connect('mongodb://localhost:27017/movieAppDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect( process.env.CONNECTION_URI , {useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log("Connection Successful"))
.catch((err) => console.log(err));

let allowedOrigins = [
    'http://localhost:8080',
    'http://testsite.com',
    'http://localhost:1234',
    'https://myflix-2021.netlify.app',
    'http://localhost:4200',
    'https://stefan-pop.github.io'
];


// Configure CORS
app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if( allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error( `Access from '${origin}' denied.`), false);
        }
        return callback(null, true);
    }
}));

// Middlewares
app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());

//authentication
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');


/**
 * Endpoints
 */

/**
 * Home page
 * @name get/
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param  {callback} routeHandler - Express route handler
 * @returns {string} - Returns a welcome message
 */
app.get('/', (req, res) => {
    res.send("Welcome to the homepage.");
})

/**
 * Get all movies
 * @name get/movies
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param {func} passport.authenticate  Authentication method using Passport
 * @param  {callback} routeHandler - Express route handler
 * @throws - Throws an error if something fails
 * @returns {Array.<Object>} - Returns an array of movie objects
 */
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find().then((movies) => {
        res.status(201).json(movies)
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
})

/**
 * Return a movie by it's title
 * @name get/movies/:title
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param {func} passport.authenticate  Authentication method using Passport
 * @param  {callback} routeHandler - Express route handler
 * @throws - Throws an error if something fails
 * @returns {Object} - Returns a movie object
 */
app.get('/movies/:title', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({title: req.params.title}).then((movie) => {
        res.status(201).json(movie);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
})

/**
 * Return details about a genre
 * @name get/movies/genres/:genre_name
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param {func} passport.authenticate  Authentication method using Passport
 * @param  {callback} routeHandler - Express route handler
 * @throws - Throws an error if something fails
 * @throws - Throws an error if a genre name is not found in database
 * @returns {Object} - Returns a genre object
 */
app.get('/movies/genres/:genre_name', passport.authenticate('jwt', {session: false}), (req,res) => {
    Movies.findOne({"genre.name": req.params.genre_name}).then((response) => {
        if (!response) {
            res.status(404).send('The genre you are looking for does not exist in our database.');
        }else {
            res.status(200).json(response.genre);
        }
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
})

/**
 * Return details about a director
 * @name get/movies/details/directors/:director_name
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param {func} passport.authenticate  Authentication method using Passport
 * @param  {callback} routeHandler - Express route handler
 * @throws - Throws an error if something fails
 * @throws - Throws an error if a director name is not found in database
 * @returns {Object} - Returns a director object
 */
app.get('/movies/details/directors/:director_name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({"director.name": req.params.director_name}).then((response) => {
        if (!response) {
            res.status(404).send('The director you are looking for does not exist in our database.');
        }else {
            res.status(200).json(response.director);
        }
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
})

/**
 * Create new account
 * @name post/users
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param {array} validationConfig configure the validation for username, password and email of a new account
 * @param  {callback} routeHandler - Express route handler
 * @throws - Throws an error if something fails
 * @throws - Throws an error if the user's credential don't pass validation
 * @throws - Throws an error if one or more credentials are already existent in database
 * @returns {Object} Returns a user object
 */
app.post('/users', [
        // Configure the validation of req.body
        check('username', 'Username is required').isLength({min: 5, max: 20}),
        check('username', 'Only alphanumeric characters are allowed'). isAlphanumeric(),
        check('pwd', 'Password is required').not().isEmpty(),
        check('email', 'Email not valid'). isEmail()
    ],(req, res) => {
        // Check the validation object for errors
        let errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

    let encryptedPassword = Users.hashPassword(req.body.pwd);
    Users.findOne( {$or: [{username: req.body.username}, {email: req.body.email}]} ).then((response) => {
        if (response) {
            res.status(400).send(req.body.username + ' or ' + req.body.email + ' already exist.');
        }else {
            Users.create({
                username: req.body.username,
                pwd: encryptedPassword,
                email: req.body.email,
                birth_date: req.body.birth_date
            }).then((user) => {
                res.status(201).json(user);
            }).catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            })
        }
    }).catch((err) => {
        res.status(500).send('Error: ' + err);
    })
})

/**
 * Return details about a user
 * @name get/users/:username
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param {func} passport.authenticate  Authentication method using Passport
 * @param  {callback} routeHandler - Express route handler
 * @throws - Throws an error if something fails
 * @returns {Object} Returns a user object
 */
app.get('/users/:username', passport.authenticate('jwt', {
    session: false
    }), (req, res) => {
        Users.findOne({
            username: req.params.username
        })
        .then((user) => {
            res.json(user);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    });

/**
 * Return the list of favorite movies
 * @name get/users/favorites/:username
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param {func} passport.authenticate  Authentication method using Passport
 * @param  {callback} routeHandler - Express route handler
 * @throws - Throws an error if something fails
 * @returns {Array<string>} Returns an array with the IDs of favorite movies
 */
app.get('/users/favorites/:username', passport.authenticate('jwt', {
    session: false
    }), (req, res) => {
        Users.findOne({
            username: req.params.username
        })
        .then((user) => {
            let favorite_movies = user.favorite_movies;
            res.json(favorite_movies);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    });

/**
 * Update an account
 * @name put/users/:username
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param {func} passport.authenticate  Authentication method using Passport
 * @param {array} validationConfig configure the validation for username, password and email of a user
 * @param  {callback} routeHandler - Express route handler
 * @throws - Throws an error if something fails
 * @throws - Throws an error if the user's credential don't pass validation
 * @throws - Throws an error if one or more credentials are already existent in database
 * @returns {Object} Returns the updated user object
 */
app.put('/users/:username', passport.authenticate('jwt', {session: false}), [
        check('username', 'Username is required').isLength({min: 5, max: 20}),
        check('username', 'Only alphanumeric characters are allowed').isAlphanumeric(),
        check('pwd', 'Password is required').not().isEmpty(),
        check('email', 'Email not valid').isEmail()
    ],(req, res) => {
        //config the validation
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    let encryptedPassword = Users.hashPassword(req.body.pwd);    
    Users.findOneAndUpdate({username: req.params.username}, {
        $set: { 
            username: req.body.username,
            pwd: encryptedPassword,
            email: req.body.email,
            birth_date: req.body.birth_date
        }}, 
        {new: true},
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            }else {
                res.status(201).json(updatedUser);
            }
        })
})

/**
 * Add a movie to favorite list
 * @name post/users/:username/favorites/:movie_id
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param {func} passport.authenticate  Authentication method using Passport
 * @param  {callback} routeHandler - Express route handler
 * @throws - Throws an error if something fails
 * @returns {Object} Returns the whole user object with the updated list of favorite movies
 */
app.post('/users/:username/favorites/:movie_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({username: req.params.username}, {
        $addToSet: { favorite_movies: req.params.movie_id }
    },
    {new: true},
    (err, updatedFavorites) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        }else {
            res.status(200).json(updatedFavorites);
        }
    })
})

/**
 * Delete a movie to favorite list
 * @name delete/users/:username/favorites/:movie_id
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param {func} passport.authenticate  Authentication method using Passport
 * @param  {callback} routeHandler - Express route handler
 * @throws - Throws an error if something fails
 * @returns {Object} Returns the whole user object with the updated list of favorite movies
 */
app.delete('/users/:username/favorites/:movie_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({username: req.params.username}, {
        $pull: { favorite_movies: req.params.movie_id }
    },
    {new: true},
    (err, updatedFavorites) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        }else {
            res.status(200).json(updatedFavorites);
        }
    })
})

/**
 * Delete account
 * @name delete/users/:username
 * @function
 * @memberof module:app
 * @param {string} path - Express path
 * @param {func} passport.authenticate  Authentication method using Passport
 * @param  {callback} routeHandler - Express route handler
 * @throws - Throws an error if something fails
 * @returns {string} Returns a confirmation message
 */
app.delete('/users/:username', passport.authenticate('jwt', {session: false}), (req, res) => {
   Users.findOneAndRemove({username: req.params.username}).then((user) => {
       if(!user) {
           res.status(400).send(req.params.username + ' was not found');
       }else {
           res.status(200).send( req.params.username + ' has been deleted');
       }
   }).catch((err) => {
       console.error(err);
       res.status(500).send('Error: ' + err);
   })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
})


app.listen(PORT, '0.0.0.0' , () => {
    console.log(`>Server running on port: ${PORT}`);
})