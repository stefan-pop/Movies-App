const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();

app.use(bodyParser.json());

let users = [
    {
      name:'user_1',
      username:'username_1',
      email: 'example@gmail.com',
      id: 'u1'
    },
    {
      name:'user_2',
      username:'username_2',
      email: 'example@gmail.com',
      id: 'u2'
    },
  
];
  
let movies = [
    {
      title: 'movie_1',
      genre: 'horror',
      description: 'The description of movie_1',
      image: 'url to the image of movie_1',
      featured: true,
      director: {
          name: 'Director1',
          birthYear: '1960',
          deathYear: '',
          biography: 'The biography of the director'
      }
    },
    {
      title: 'movie_2',
      genre: 'drama',
      description: 'The description of movie_2',
      image: 'url to the image of movie_2',
      featured: true,
      director: {
          name: 'Director2',
          birthYear: '1960',
          deathYear: '',
          biography: 'The biography of the director'
      }
    },
    {
      title: 'movie_3',
      genre: 'horror',
      description: 'The description of movie_3',
      image: 'url to the image of movie_2',
      featured: true,
      director: {
          name: 'Director3',
          birthYear: '1960',
          deathYear: '',
          biography: 'The biography of the director'
      }
    },
    {
      title: 'movie_4',
      genre: 'adventure',
      description: 'The description of movie_4',
      image: 'url to the image of movie_4',
      featured: true,
      director: {
          name: 'Director4',
          birthYear: '1960',
          deathYear: '',
          biography: 'The biography of the director'
      }
    },
    {
      title: 'movie_5',
      genre: 'comedy',
      description: 'The description of movie_5',
      image: 'url to the image of movie_5',
      featured: true,
      director: {
          name: 'Director5',
          birthYear: '1960',
          deathYear: '',
          biography: 'The biography of the director'
      }
    }
]

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

app.listen(8080, () => {
    console.log('Server running');
})