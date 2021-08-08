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

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://myflix-2021.netlify.app'];


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

app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());

//authentication
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// Home Page
app.get('/', (req, res) => {
    res.send("Welcome to the homepage.");
})

// Return all the movies in json format
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find().then((movies) => {
        res.status(201).json(movies)
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
})

// Return a movie by title
app.get('/movies/:title', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({title: req.params.title}).then((movie) => {
        res.status(201).json(movie);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
})

// Return details about a genre
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

// Return a director by name
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

// Create a new user
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

// Get a user by username
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

// Get the list of favorite movies for a speciffic user by username
app.get('/users/favorites/:username', passport.authenticate('jwt', {
    session: false
    }), (req, res) => {
        Users.findOne({
            username: req.params.username
        })
        .then((user) => {
            res.json(user);
            let favorite_movies = user.favorite_movies;
            return favorite_movies;
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    });

// Update user info
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

// Add a movie as favorite
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

// Delete a movie from favorites by the title of the movie
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

// Delete account by the username of the user
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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
})


app.listen(PORT, '0.0.0.0' , () => {
    console.log(`>Server running on port: ${PORT}`);
})