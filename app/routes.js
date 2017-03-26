// app/routes.js
module.exports = function (app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    /*app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });*/


    app.get('/', checkAuthWithReturn, function (req, res) {
        res.render('index.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });
    

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        // TODO: Redirect to last page instead
        //successRedirect: '/', // redirect to the secure profile section
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
            var redir = req.session.redirectTo ? req.session.redirectTo : '/';
            delete req.session.redirectTo;
            res.redirect(redir);

        });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/register', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('register.ejs', { message: req.flash('registerMessage') });
    });

    // process the signup form
    app.post('/register', passport.authenticate('local-register', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/register', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    /*app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });*/

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

};

// Check authentication without routing back to the requested page
function checkAuth(req, res, next) {
    // if user is not authenticated in the session, redirect to login
    if (!req.isAuthenticated()){
		res.redirect('/login');
    } else {
        next();
    }
}

// Check auth and remember where the user came from
function checkAuthWithReturn(req, res, next) {
    // If user is not authenticated and should return to current page
    if (!req.isAuthenticated()) {
        req.session.redirectTo = req.path;
        res.redirect('/login');
    } else {
        next();
    }

    
}
