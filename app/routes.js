// app/routes.js
module.exports = function (app, passport, ejs, fs, expressValidator, bot, dlib) {

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

    // https://discordapp.com/api/oauth2/authorize?client_id=157730590492196864&scope=bot&permissions=8&redirect_uri=https%3A%2F%2Fnicememe.website

    app.get('/profile', checkAuthWithReturn, function (req, res) {

        var _stats = {};

        if (isUserRootAdmin(req.user)) {
            console.log("root request");

            getNumberOfMongoDBUsers().then(function (count) {

                _stats.numOfUsers = count;

                res.render('profile.ejs', {
                    user: req.user, // get the user out of session and pass to template
                    stats: _stats
                });
            })
            .catch(function (error) {
                console.error(error);

                _stats.numOfUsers = undefined;

                res.render('profile.ejs', {
                    user: req.user, // get the user out of session and pass to template
                    stats: _stats
                });

            });
        } else {
            res.render('profile.ejs', {
                user: req.user, // get the user out of session and pass to template
                stats: _stats
            });
        }
    });

    app.get('/allusers', checkAuthWithReturn, function (req, res) {

        var _stats = {};

        if (isUserRootAdmin(req.user)) {

            getNumberOfMongoDBUsers().then(function (count) {

                _stats.numOfUsers = count;

                getAllUsers(function (err, users) {

                    if (err) {
                        console.error(error);

                        res.render('allusers.ejs', {
                            users: [],
                            stats: _stats
                        });
                    } else {
                        console.log(users);
                        res.render('allusers.ejs', {
                            users: users,
                            stats: _stats,
                            servers: getDiscordBotServerList()
                        });
                    }

                });
            })
            .catch(function (error) {
                console.error(error);

                _stats.numOfUsers = undefined;

                res.render('allusers.ejs', {
                    users: [], 
                    stats: _stats
                });

            });

        } else {
            res.render('allusers.ejs', {
                users: [],
                stats: _stats
            });
        }
    });

    app.get('/allservers', checkAuthWithReturn, function (req, res) {

        var _stats = {};

        if (isUserRootAdmin(req.user)) {

            getGuildPopulatedAccess(function (err, dbGuilds) {

                var botGuilds = getDiscordBotServerList();

                var servers = [];

                if (!err) {
                    botGuilds.forEach(function (botGuild) {

                        var rusers = [];

                        dbGuilds.forEach(function (dbGuild) {
                            if (dbGuild.guildId == botGuild.id) {

                                var user = {
                                    id: dbGuild.userId._id,
                                    name: dbGuild.userId.local.username,
                                    level: dbGuild.level
                                }

                                rusers.push(user);
                            }
                        });

                        var server = {
                            guildName: botGuild.name,
                            guildId: botGuild.id,
                            users: rusers
                        }

                        console.log("Serv: " + JSON.stringify(server));

                        servers.push(server);
                    });
                } else {
                    console.log(err);
                }

                console.log("Servers: " + JSON.stringify(servers));

                res.render('allservers.ejs', {
                    servers: servers
                });

            });
            

        } else {
            res.render('allservers.ejs', {
                servers: []
            });
        }
    });
    
    app.post('/send-chat-message', checkAuth, function (req, res) {
        req.checkBody('channelId', 'Invalid CHID').notEmpty().isInt();
        req.checkBody('msg', 'Empty message').notEmpty();

        req.getValidationResult().then(function (result) {
            if (!result.isEmpty()) {
                res.json({
                    error: 'There have been validation errors: ' + JSON.stringify(result.array())
                });
            } else {
                // TODO Send message

                var channel = findClientGuildChannel(req.body.channelId);

                channel.sendMessage(req.body.msg).then(function (e) {
                    res.json({
                        success: "Success!"
                    });
                }).catch(function (err) {
                    res.json({
                        error: 'Unknown error: ' + err
                    });
                });
            }
        });
    });

    app.post('/add-guild-access', checkAuth, function (req, res) {
        req.checkBody('level', 'Invalid level').notEmpty().isInt();
        req.checkBody('guild', 'Invalid guild').notEmpty().isInt();
        req.checkBody('userId', 'Invalid UID').notEmpty();

        req.getValidationResult().then(function (result) {
            if (!result.isEmpty()) {
                res.json({
                    error: 'There have been validation errors: ' + JSON.stringify(result.array())
                });
            } else {
                addUserGuild(req.body.guild, req.body.userId, req.body.level,
                    function (err, access) {
                        if (err) {
                            res.json({
                                error: 'Unknown error processing guild access grant: ' + err
                            });
                        } else {
                            res.json({
                                access: access
                            });
                        }
                    }
                );
            }
        });
    });

	app.get('/map', checkAuthWithReturn, function (req, res) {
        res.render('map.ejs', {
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
    
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.get('/menu', checkAuthWithReturn, function (req, res) {
        res.render('menu.ejs', {
            user: req.user // get the user out of session and pass to template
        });
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
            successRedirect: '/profile', // TODO
            failureRedirect: '/login'
        }));

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user = req.user;

        // Clean up
        user.facebook.id = undefined;
        user.facebook.token = undefined;
        user.facebook.name = undefined;
        user.facebook.email = undefined;

        user.save(function (err) {
            // TODO: should do context-aware redirect here I think, or even ajax request
            res.redirect('/profile');
        });
    });


    app.get('/ajax-get-menu', function (req, res) {

        var templatePath = getMenuTemplate(req.query.pageAction, req.user);

        var template = fs.readFileSync(templatePath, 'utf-8');

        getMenuData(req.query.pageAction, req.query.dataContext, req.user,
            function (err, data) {

                if (err) {
                    console.error(err);
                } 

                res.send({
                    template: template,
                    data: data
                });
            });
        
    });

    app.get('/ajax-get-maincontent', function (req, res) {

        var templatePath = getMainContentTemplate(req.query.pageAction, req.user);

        var template = '';

        if (templatePath != '') {
            template = fs.readFileSync(templatePath, 'utf-8');
        } 

        // Data promise
        getMainContentData(req.query.pageAction, req.query.dataContext, req.user,
            function (err, dataPromise) {

                if (err) {
                    console.error(err);

                    var data = new Object();
                    data.channel = req.query.dataContext;
                    data.chatMessages = [];

                    res.send({
                        template: template,
                        data: data,
                    });
                } else {
                    dataPromise.then(
                        function (messages) {

                            var data = new Object();
                            data.channel = req.query.dataContext;

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
                            data.channel = req.query.dataContext;
                            data.chatMessages = [];

                            res.send({
                                template: template,
                                data: data
                            });

                        });

                }
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
