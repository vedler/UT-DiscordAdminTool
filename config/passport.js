// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
// var mysql = require('mysql');

// TODO: Different library for hashing
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var mongoose = require('mongoose');
//var connection = mysql.createConnection(dbconfig.connection);
mongoose.Promise = global.Promise;
mongoose.connect(dbconfig.url, function(err, db) {

  if (err) throw err;
  console.log("Connection established to the MongoDB database.");
});

var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var User = require('../app/models/user');
// load the auth variables
var configAuth = require('./auth');

//connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function (passport) {
    // used to serialize the user for the session
    passport.serializeUser((user, done) => done(null, user.id));

	// used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // Passport strategy for registration
    passport.use(
        'local-register',
        new LocalStrategy({
            passReqToCallback: true
        },
            function (req, username, password, done) {


				// asynchronous
				//process.nextTick(function() {
					// if the user is not already logged in:
					if (!req.user) {
						User.findOne({ 'local.username' :  username }, function(err, user) {
							// if there are any errors, return the error
							if (err){
								//console.warn("siin");
								return done(err);
							}
		
							// check to see if theres already a user with that username
							if (user) {
								return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
							} else {
		
								// create the user
								var newUser = new User();
		
								newUser.local.username = username;
								newUser.local.password = newUser.generateHash(password);

								newUser.save(function(err) {
                                    if (err) {
                                        return done(err);
                                    }
									return done(null, newUser);
								});
							}
		
						});
					// if the user is logged in but has no local account...
                    }
                    else {
						// user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
						return done(null, req.user);
					}
		
		        //});


            })
    );

    // Passport strategy for login
    passport.use(
        'local-login',
        new LocalStrategy({
            passReqToCallback: true
        },
            function (req, username, password, done) {
				// asynchronous
				//process.nextTick(function() {
					User.findOne({ 'local.username' :  username }, function(err, user) {
						// if there are any errors, return the error
                        if (err) {
                            return done(err);
                        }
							
						// if no user is found, return the message
                        if (!user) {
                            return done(null, false, req.flash('loginMessage', 'No user found.'));
                        }
							
                        if (!user.validPassword(password)) {
                            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                        }
						// all is well, return user
                        else {
                            return done(null, user);
                        }
							
					});
				//});

            })
    );


	// Passport strategy for facebook

	passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ["id", "emails", "name"],
		passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        //process.nextTick(function() {

        // check if the user is already logged in
        if (!req.user) {
            // User has not logged in

            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {

                    // if there is a user id already but no token (user was linked at one point and then removed)
                    if (!user.facebook.token) {
                        user.facebook.token = token;
                        user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                        user.save(function(err) {
                            if (err)
                                return done(err);
                                    
                            return done(null, user);
                        });
                    }

                    return done(null, user); // user found, return that user
                }
                else {
                    return done(null, false, req.flash('loginMessage', 'No user linked to that Facebook account! You must create an account first and then link a Facebook account to it.'));
                }
            });

        } else {
            // user already exists and is logged in, we have to link accounts

            // Check if user already has a facebook linked to the account

            if (!req.user.facebook || !req.user.facebook.id || req.user.facebook.id == undefined) {
                var user = req.user; // pull the user out of the session

                user.facebook.id = profile.id;
                user.facebook.token = token;
                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                user.save(function (err) {
                    if (err) {
                        return done(err);
                    }

                    return done(null, user);
                });
            } else {
                return done(null, false, req.flash('loginMessage', 'User already has a Facebook account linked!'));
            }
        }
        //});

    }));
    
};
