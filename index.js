const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
})

// Return all the movies in json format
app.get('/movies', (req, res) => {
    res.json(movies);
})

// Return a movie by title
app.get('/movies/:title', (req, res) => {
    let returnByTitle = movies.find((x) => {return x.title == req.params.title });
    res.json(returnByTitle);
})

// Filter the movies by genre
app.get('/movies/genre/:genre', (req, res) => {
    let returnByGenre = movies.filter((x) => {return x.genre == req.params.genre });
    res.json(returnByGenre);
})

// Return a list of all directors
app.get('/movies/details/directors', (req, res) => {
    let directorsList = movies.map((x) => { return x.director});
    res.json(directorsList);
})

// Return a director object by name
app.get('/movies/details/directors/:director', (req, res) => {
    let directorObject = movies.find((x) => { return x.director.name == req.params.director})
    res.json(directorObject.director);
})

// Create a new user
app.post('/users', (req, res) => {
    if(req.body.name && req.body.email) {
        req.body.id = uuid.v4();
        users.push(req.body);
        res.send(`User ${req.body.name} added successfully.
        User ID: ${req.body.id}`);
    }else {
        res.status(404).send('Missing name');
    }
})

// Update user info
app.put('/users/:id/:new_username', (req, res) => {
    let user = users.find((x) => { return x.id == req.params.id});
    let prevUsername = user.username;
    user.username = req.params.new_username;
     if(user) {
        console.log(user.username);
        res.send(`The username of ${user.name} was updated from '${prevUsername}' to '${user.username}'`)
     }
})

// Add a movie as favorite
app.post('/users/:user/favorites', (req, res) => {
    let user = users.find((x) => { return x.name == req.params.user});

    if(user) {
        res.send('New movie added to favorites')
    }
})

// Delete a movie from favorites by the title of the movie
app.delete('/users/:user/favorites/:movie_title', (req, res) => {
    let movieToDelete = movies.find((x) => {return x.title = req.params.movie_title});
    let user = users.find((x) => { return x.name == req.params.user});

    if(movieToDelete && user) {
        console.log(movieToDelete);
        res.send(`Movie ${movieToDelete.title} has been removed`);
    }
})

// Delete account by the name of the user
app.delete('/users/:user', (req, res) => {
    let user = users.find((x) => { return x.name == req.params.user});

    if(user) {
        res.send(`The account with the name: ${user.name} has been removed successfully`)
    }
})


app.listen(8080, () => {
    console.log('Server running');
})