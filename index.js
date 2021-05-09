const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();

app.use(morgan('common'));

app.use(express.static('public'))

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server-side Error');
})

app.get('/movies', (req, res) => {
    res.json( [
        {movie_1:'info_1'}, 
        {movie_2:'info_2'},
        {movie_3:'info_3'}
    ]);
})

app.get('/', (req, res) => {
    res.send('Test root path');
})

app.listen(8080, () => {
    console.log('Server running');
})