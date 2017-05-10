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
  console.log("sees");
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
    /*passport.deserializeUser(function (id, done) {
        connection.query("SELECT * FROM users WHERE p_id = ? ", [id], function (err, rows) {

            var user = {
                id: rows[0].p_id.value,
                provider: rows[0].provider.value,
                name: rows[0].name.value,
                password: rows[0].password.value,
                token: rows[0].token.value,
                email: rows[0].email.value
            }

            done(err, user);
        });
    });*/

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

                /*connection.query("SELECT * FROM users WHERE name = ?", [username], function (err, rows) {
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
                });*/


				// asynchronous
				//process.nextTick(function() {
					// if the user is not already logged in:
					if (!req.user) {
						User.findOne({ 'local.username' :  username }, function(err, user) {
							// if there are any errors, return the error
							if (err){
								console.warn("siin");
								return done(err);
							}
		
							// check to see if theres already a user with that username
							if (user) {
								return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
							} else {
		
								// create the user
								var newUser            = new User();
		
								newUser.local.username    = username;
								newUser.local.password = newUser.generateHash(password);

								newUser.save(function(err) {
									if (err)
										return done(err);
		
									return done(null, newUser);
								});
							}
		
						});
					// if the user is logged in but has no local account...
					} else if ( !req.user.local.username ) {
						// ...presumably they're trying to connect a local account
						// BUT let's check if the username used to connect a local account is being used by another user
						User.findOne({ 'local.username' :  username }, function(err, user) {
							if (err)
								return done(err);
                    
		                    if (user) {
								return done(null, false, req.flash('loginMessage', 'That username is already taken.'));
								// Using 'loginMessage instead of signupMessage because it's used by /connect/local'
							} else {
								var user = req.user;
								user.local.username = username;
								user.local.password = user.generateHash(password);
								user.save(function (err) {
									if (err)
										return done(err);
		                            
									return done(null,user);
								});
							}
						});
					} else {
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
                /*connection.query("SELECT * FROM users WHERE name = ?", [username], function (err, rows) {
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
                });*/

				// asynchronous
				//process.nextTick(function() {
					User.findOne({ 'local.username' :  username }, function(err, user) {
						// if there are any errors, return the error
						if (err)
							return done(err);

						// if no user is found, return the message
						if (!user)
							return done(null, false, req.flash('loginMessage', 'No user found.'));

		                if (!user.validPassword(password))
				            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

						// all is well, return user
						else
							return done(null, user);
					});
				//});

            })
    );


	// Passport strategy for facebook

	/*var fbStrategy = configAuth.facebookAuth;
    fbStrategy.passReqToCallback = true;  // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    
	passport.use(new FacebookStrategy(fbStrategy,*/

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
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

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
                    } else {
                        // if there is no user, create them
                        var newUser            = new User();

                        newUser.facebook.id    = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                user.save(function(err) {
                    if (err)
                        return done(err);
                        
                    return done(null, user);
                });

            }
        });

    }));


	/*
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ["id", "emails", "name"]
    },

        // facebook will send back the token and profile
        function (accessToken, refreshToken, profile, done) {
            

            // asynchronous
            //process.nextTick(function () {
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
	*/
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