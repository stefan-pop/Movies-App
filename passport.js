const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

/**
 * This strategy is used by the '/login' route.
 * It checks if the username and password a user wants to authenticate with, exist in the database.
 */
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'pwd'
}, (username, password, done) => {
    console.log(username + ' ' + password);
    Users.findOne({ username }, (error, user) => {
        if(error) {
            console.log(error);
            return done(error);
        }
        
        if(!user) {
            console.log('incorrect username');
            return done(null, false, {message: 'Incorrect username or password.'});
        }

        if(!user.validatePassword(password)) {
            console.log('incorrect password');
            return done(null, false, {message: 'Incorrect password'});
        }

        console.log('finnished');
        return done(null, user);
    });
}));

/**
 * This strategy is used for authorization.
 * Here the user that makes the request is ckecked against the databse using the user's id extracted from the JWT.
 */
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret_jwt'
}, (jwtPayload, done) => {
    return Users.findById(jwtPayload._id).then(user =>{
        return done(null, user);
    }).catch(error => {
        return done(error);
    });
}));