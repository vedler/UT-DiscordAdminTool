// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
// TODO: Different library for hashing
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function (passport) {
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
    // used to serialize the user for the session
    /*passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    
    passport.deserializeUser(function (id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ", [id], function (err, rows) {
            done(err, rows[0]);
        });
    });*/
    /*passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });*/

    // Passport strategy for registration
    passport.use(
        'local-register',
        new LocalStrategy({

            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
            function (req, username, password, done) {

                connection.query("SELECT * FROM users WHERE username = ?", [username], function (err, rows) {
                    if (err)
                        return done(err);
                    if (rows.length) {
                        // We dont want to find an user with this name already
                        return done(null, false, req.flash('registerMessage', 'That username is already taken.'));
                    } else {
                        // This username is unique, create the user
                        var newUserMysql = {
                            username: username,
                            // TODO: Different library for hashing
                            password: bcrypt.hashSync(password, bcrypt.genSaltSync(), null)  // use the generateHash function in our user model
                        };

                        var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

                        connection.query(insertQuery, [newUserMysql.username, newUserMysql.password], function (err, rows) {
                            newUserMysql.id = rows.insertId;

                            return done(null, newUserMysql);
                        });
                    }
                });
            })
    );

    // Passport strategy for login
    passport.use(
        'local-login',
        new LocalStrategy({

            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
            function (req, username, password, done) {
                connection.query("SELECT * FROM users WHERE username = ?", [username], function (err, rows) {
                    if (err)
                        return done(err);
                    if (!rows.length) {
                        // No such user found, send a flash message
                        return done(null, false, req.flash('loginMessage', 'No user found.'));
                    }

                    // User was found but is the password correct?
                    if (!bcrypt.compareSync(password, rows[0].password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                    // all is well, return successful user
                    return done(null, rows[0]);
                });
            })
    );
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        //profileFields": ["id", "birthday", "email", "first_name", "gender", "last_name"] (Might be useful later on)
    },

        // facebook will send back the token and profile
        function (req, token, refreshToken, profile, done) {

            /* asynchronous
            process.nextTick(function () {*/
            connection.query("SELECT * FROM users WHERE token = ?", [token], function (err, newUser) {
                if (err)
                    return done(err);
                if (!newUser.length) {
                    // No such user found, send a flash message
                    var newUserMysql = {
                        username: profile.name.givenName + ' ' + profile.name.familyName,
                        password: '',
                        token: token
                        // TODO: Different library for hashing
                    };

                    var insertQuery = "INSERT INTO users ( username, password, token ) values (?, ?, ?)";
                    //console.log('started from zero');

                    connection.query(insertQuery, [newUserMysql.username, newUserMysql.password, newUserMysql.token], function (err, rows) {
                        newUserMysql.id = rows.insertId;
                        //console.log('now we here');
                        return done(null, newUserMysql);
                    });
                }
                // all is well, return successful user
                return done(null, newUser[0]);
            });
        })
    );

};
                /* find the user in the database based on their facebook id
                User.findOne({ 'facebook.id': profile.id }, function (err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        var newUser = new User();
                        function (req, token, done) {
                        
                        // if there is no user found with that facebook id, create them
                        var newUser = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id = profile.id; // set the users facebook id                   
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                        // save our user to the database
                        newUser.save(function (err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });
            });

        }));
};*/