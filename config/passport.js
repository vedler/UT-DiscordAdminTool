// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User       		= require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
		usernameField : 'user_name',
		emailField : 'user_email',
        passwordField : 'password',
		bioField : 'user_bio',
        //passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, user_email, password, user_name, user_bio, done) {

		// asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  user_email }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
				console.log(err);
                return done(err);
			}

            // check to see if theres already a user with that email
            if (user) {
				console.log('signupMessage: That email is already taken.');
                return done(null, false, {message: 'signupMessage: That email is already taken.'});
            } else {

				// if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
				newUser.local.name	   = user_name;
                newUser.local.email    = user_email;
                newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model
				newUser.local.bio	   = user_bio;

				// save the user
                newUser.save(function(err) {
                    if (err){
						console.log(err);
                        throw err;
					}
                    return done(null, newUser);
                });
            }

        });

		});

    }));


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'uname',
        passwordField : 'psw',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, uname, psw, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  uname }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err) {
				console.log(err);
                return done(err);
			}

            // if no user is found, return the message
            if (!user){
				console.log('loginMessage: No user found.');
                return done(null, false, {message: 'loginMessage: No user found.'}); // req.flash is the way to set flashdata using connect-flash
			}

            // if the user is found but the password is wrong
            if (!user.validPassword(psw)){
				console.log('loginMessage: Oops! Wrong password.');
                return done(null, false, {message: 'loginMessage: Oops! Wrong password.'}); // create the loginMessage and save it to session as flashdata
			}

            // all is well, return successful user
            return done(null, user);
        });

    }));

};
