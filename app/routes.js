// app/routes.js
module.exports = function (app, passport, ejs) {

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

    app.get('/test-noredir', checkAuth, function (req, res) {
        res.render('index.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

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
            var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
            delete req.session.redirectTo;
            res.redirect(redirectTo);

        });

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

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/ajax-get-menu', function (req, res) {
        
        return res.render(getMenuTemplate(req.query.pageAction), getMenuData(req.query.pageAction, req.query.dataContext));
        
    });

};

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
        req.session.redirectTo = req.path;
        res.redirect('/login');
    } else {
        next();
    }
}
