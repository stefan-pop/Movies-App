const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    genre: {
        name: String,
        description: String
    },
    director: {
        name: String,
        bio: String,
        birth: Date,
        death: Date
    },
    imagePath: String,
    featured: Boolean
})

let userSchema = mongoose.Schema({
    username: {type: String, required: true},
    pwd: {type: String, required: true},
    email: {type: String, required: true},
    birth_date: Date,
    favorite_movies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
})

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;