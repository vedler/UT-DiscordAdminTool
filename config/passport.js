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

// load the auth variables
var configAuth = require('./auth');

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function (passport) {
    // used to serialize the user for the session
    passport.serializeUser((user, done) => done(null, user.id));

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        connection.query("SELECT * FROM users WHERE p_id = ? ", [id], function (err, rows) {

            console.log('des');

            var user = {
                id: rows[0].p_id.value,
                provider: rows[0].provider.value,
                name: rows[0].name.value,
                password: rows[0].password.value,
                token: rows[0].token.value,
                email: rows[0].email.value
            }
            console.log('desend');

            done(err, user);
        });
    });

    // Passport strategy for registration
    passport.use(
        'local-register',
        new LocalStrategy({

            usernameField: 'name',
            passwordField: 'password',
            passReqToCallback: true
        },
            function (req, username, password, done) {

                connection.query("SELECT * FROM users WHERE name = ?", [username], function (err, rows) {
                    if (err)
                        return done(err);
                    if (rows.length) {
                        // We dont want to find an user with this name already
                        return done(null, false, req.flash('registerMessage', 'That username is already taken.'));
                    } else {
                        // This username is unique, create the user

                        var user = {
                            id: username.toLowerCase() + "-local",
                            provider: 'local',
                            name: username,
                            password: bcrypt.hashSync(password, bcrypt.genSaltSync(), null),  // use the generateHash function in our user model,
                            token: '',
                            email: ''
                        }

                        var insertQuery = "INSERT INTO users ( name, password, p_id, provider, token ) values (?,?,?,?,?)";

                        connection.query(insertQuery, [user.username, user.password, user.id, user.provider, ''], function (err, rows) {
                            //newUserMysql.id = rows.insertId + '.' + user.provider;

                            return done(null, user);
                        });
                    }
                });
            })
    );

    // Passport strategy for login
    passport.use(
        'local-login',
        new LocalStrategy({

            usernameField: 'name',
            passwordField: 'password',
            passReqToCallback: true
        },
            function (req, username, password, done) {
                connection.query("SELECT * FROM users WHERE name = ?", [username], function (err, rows) {
                    if (err)
                        return done(err);
                    if (!rows.length) {
                        // No such user found, send a flash message
                        return done(null, false, req.flash('loginMessage', 'No user found.'));
                    }

                    var user = {
                        id: rows[0].p_id.value,
                        provider: rows[0].provider.value,
                        name: rows[0].name.value,
                        password: rows[0].password.value,
                        token: rows[0].token.value,
                        email: rows[0].email.value
                    }

                    // User was found but is the password correct?
                    if (!bcrypt.compareSync(password, user.password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                    // all is well, return successful user
                    return done(null, user);
                });
            })
    );


    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ["id", "emails", "name"]
    },

        // facebook will send back the token and profile
        function (accessToken, refreshToken, profile, done) {
            

            /* asynchronous
            process.nextTick(function () {*/
            connection.query("SELECT * FROM users WHERE p_id = ?", [profile.id.toString() + '.' + 'facebook'], function (err, exUser) {
                if (err) {
                    return done(err);
                }

                if (exUser.length != 0) {

                    var user = {
                        id: exUser[0].p_id.value,
                        provider: exUser[0].provider.value,
                        name: exUser[0].name.value,
                        password: exUser[0].password.value,
                        token: exUser[0].token.value,
                        email: exUser[0].email.value
                    }

                    return (null, user);
                } else {

                    var user = {
                        id: profile.id.toString() + '.' + 'facebook',
                        provider: 'facebook',
                        name: profile.name.givenName + '.' + profile.name.familyName + '.' + profile.id,
                        password: '',
                        token: accessToken,
                        email: profile.emails[0].value
                    }

                    var insertQuery = "INSERT INTO users ( name, password, p_id, email, token, provider ) values (?, ?, ?, ?, ?, ?)";

                    connection.query(insertQuery, [user.name, '', user.id, user.email, accessToken, user.provider], function (err, rows) {

                        if (err) {
                            // TODO: Might not want this here
                            console.log(err);
                            return done(err);
                        }

                        //newUserMysql.id = rows.insertId;
                        
                        return done(null, user);
                    });
                }
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