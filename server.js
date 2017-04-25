// server.js

// setup

// dependencies
var path = require('path');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var i18n = require('i18n');
var app = express();
var port = process.env.PORT || 8080;
var ejs = require('ejs');

var fs = require('fs');

var passport = require('passport');
var flash = require('connect-flash');

// configuration 

// connect to our database (done under the passport script)
require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.use('/static', express.static(path.join(__dirname, 'static')))

app.use(bodyParser.urlencoded({
    extended: true
}));

i18n.configure({
    // setup some locales - other locales default to en silently
    locales: ['en', 'ee'],

    // sets a custom cookie name to parse locale settings from
    cookie: 'discord-at-language',

    // where to store json files - defaults to './locales'
    directory: __dirname + '/locales'
});

app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'TFdZNtx3JY9bwKvr9TPRBJP7',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// i18n init parses req for language headers, cookies, etc.
app.use(i18n.init);

// routes 
require('./app/globalparams.js')(app, passport, i18n);
require('./app/routes.js')(app, passport, ejs, fs); // load our routes and pass in our app and fully configured passport

require('./app/menuloader.js')(app, passport, path, fs);

// start the app
app.listen(port);
console.log('The magic happens on port ' + port);
