const express = require('express');
const morgan = require('morgan');
const app = express();

app.get('/movies', (req, res) => {
    res.json( [
        {movie_1:'info_1'}, 
        {movie_2:'info_2'},
        {movie_3:'info_3'}
    ])
})