// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
// TODO: Different library for hashing
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function (passport) {

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ", [id], function (err, rows) {
            done(err, rows[0]);
        });
    });

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
};