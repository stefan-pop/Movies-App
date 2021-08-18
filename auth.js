const jwtSecret = 'secret_jwt';
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('./passport.js');

/**
 * Function that generate the JWT token
 * @param {object} user The user object that will be encrypted in the payload of JWT
 * @returns the JWT token, with the user's username encoded in it.
 */
let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

/**
 * Login route
 * @param {*} router 
 * @returns the user with all it's details and a token for the authenticated user
 */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, {session: false}, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({user, token});
            });
        })(req, res);
    });
}