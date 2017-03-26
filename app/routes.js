// app/routes.js
module.exports = function (app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    /*app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });*/

    app.get('/', isLoggedIn, function (req, res) {
        res.render('index.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });


	app.get('/test', isLoggedIn, function (req, res) {
        res.render('test.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });
    

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', isLoggedIn, function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
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
			var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
			delete req.session.redirectTo;
			res.redirect(redirectTo);
        });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/register', isLoggedIn, function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('register.ejs', { message: req.flash('registerMessage') });
    });

    // process the signup form
    app.post('/register', passport.authenticate('local-register', {
        failureRedirect: '/register', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }),
        function (req, res) {
            console.log("hello");

            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
			var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
			delete req.session.redirectTo;
			res.redirect(redirectTo);
	});

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

// route middleware to make sure
function isLoggedIn(req, res, next) {
    // if user is not authenticated in the session, redirect to login
    if (!req.isAuthenticated()){
		if (req.path.includes('login') || req.path.includes('register')){
			next();
		} else {
			req.session.redirectTo = req.path;
			res.redirect('/login');
		}
	}
	// otherwise carry on and can't force redirect in address bar to login nor register
	else {
		if (req.path.includes('login') || req.path.includes('register')){
			res.redirect('/');
		} else {
			next();
		}
    }
}