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
require('./app/maincontentloader.js')(app, passport, path, fs);

// -------------------- Discord connection -------------------------

try {
	var Discord = require("discord.js");
} catch (e) {
	console.log(e.stack);
	console.log(process.version);
	console.log("Please run npm install and ensure it passes with no errors!");
	process.exit();
}

try {
    var AuthDetails = require("./config/discord-auth.json");
} catch (e) {
    console.log("Discord authentication config (config/discord-auth.json) not found.\n" + e.stack);
    process.exit();
}

var bot = new Discord.Client();

bot.on("ready", function() {
    console.log("Logged in! Serving in " + bot.guilds.array().length + " servers");
    bot.user.setGame("Discord Admin Tool bot");
});

var io = require('socket.io').listen(8000);

io.sockets.on('connection', function (socket) {

    console.log("socket conn: " + socket);
    
    socket.on('disconnect', function () {
        console.log("socket disc: " + socket);
    });
});

require('./app/discord-lib.js')(app, Discord, bot, io);

// --------------- start the app -----------------------------
app.listen(port);
console.log('The magic happens on port ' + port);

if (AuthDetails.bot_token) {
    console.log("logging in with token");
    bot.login(AuthDetails.bot_token);
} 

