// app/routes.js
module.exports = function (app, passport, ejs, fs) {

// normal routes ===============================================================

    app.get('/', checkAuth, function (req, res) {
        res.render('index.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    // Redirection test paths
    app.get('/test', checkAuthWithReturn, function (req, res) {
        res.render('index.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    app.get('/test-2', checkAuthWithReturn, function (req, res) {
        res.render('index.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    app.get('/test-3', checkAuthWithReturn, function (req, res) {
        res.render('index.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

	app.get('/profile', checkAuthWithReturn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    app.get('/test-noredir', checkAuth, function (req, res) {
        res.render('index.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

	// LOGOUT  =================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

// locally --------------------------------
	// LOGIN ===============================
    // show the login form
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        //successRedirect: '/', // redirect to the secure profile section -- REPLACED with a "dynamic" selection of redirection path
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }),
        function (req, res) {
            console.log("hello");

            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }

            // If redirection path is remembered, then use it to redirect
            var redirectTo = req.session.autoRedirectTo ? req.session.autoRedirectTo : '/';
            delete req.session.autoRedirectTo;
            res.redirect(redirectTo);

        });

	// SIGNUP =================================
    // show the signup form
    app.get('/register', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('register.ejs', { message: req.flash('registerMessage') });
    });

    // process the signup form
    app.post('/register', passport.authenticate('local-register', {
        // TODO: We dont want to return to some old page, because the page content should be user-specific, a new user would have no context anyway
        // TODO: Later the authentication check should check for more than if the user is logged in or not (context access, permission levels etc.)
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/register', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

// facebook -------------------------------

    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================    

// locally --------------------------------
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-register', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

// facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));


// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });


    app.get('/ajax-get-menu', function (req, res) {

        var templatePath = getMenuTemplate(req.query.pageAction);

        var template = fs.readFileSync(templatePath, 'utf-8');

        res.send({
            template: template,
            data: getMenuData(req.query.pageAction, req.query.dataContext)
        });
    });

    app.get('/ajax-get-maincontent', function (req, res) {

        var templatePath = getMainContentTemplate(req.query.pageAction);

        var template = '';

        if (templatePath != '') {
            template = fs.readFileSync(templatePath, 'utf-8');
        } 

        // Data promise
        getMainContentData(req.query.pageAction, req.query.dataContext)
            .then(function (messages) {

                var data = new Object();

                var chatMessages = [];

                console.log("found msg: " + messages);

                messages.forEach(function (message) {
                    console.log("msg: " + message);
                    var chatMessage = new Object();

                    chatMessage.sender = message.author.username;
                    chatMessage.message = message.content;

                    chatMessages.push(chatMessage);
                });

                data.chatMessages = chatMessages;

                res.send({
                    template: template,
                    data: data
                });
            })
            .catch(function (error) {
                console.error(error);

                var data = new Object();
                data.chatMessages = [];

                res.send({
                    template: template,
                    data: data
                });

            });
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// Check authentication without routing back to the requested page
function checkAuth(req, res, next) {
    // if user is not authenticated in the session, redirect to login
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        next();
    }
}

// Check auth and remember where the user came from
function checkAuthWithReturn(req, res, next) {
    // If user is not authenticated and should return to current page
    if (!req.isAuthenticated()) {
        req.session.autoRedirectTo = req.path;
        res.redirect('/login');
    } else {
        next();
    }
}
