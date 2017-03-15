var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var morgan       = require('morgan');
var flash    = require('connect-flash');
var session      = require('express-session');

var configDB = require('./config/database.js');

mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

 
var app = express()

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(session({secret: 'sessionsecret', 
                 saveUninitialized: true,
                 resave: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static('public'));
app.get('/', function (req, res) {
	console.log('/');
   res.sendFile( __dirname + "/" + "index.htm" );
})

app.post('/', passport.authenticate('local-login', {
		successRedirect : '/login', // redirect to the secure profile section
		failureRedirect : '/', // redirect back to the signup page if there is an error
		failureFlash: 'Invalid username or password.',
		successFlash: 'Welcome!'
	}), function (req, res) {
	console.log(res);
	} );

app.get('/login', function (req, res) {
   console.log('/login');
   res.sendFile( __dirname + "/" + "login.htm" );
})


app.get('/register', function (req, res) {
   console.log('/register');
   res.sendFile( __dirname + "/" + "register.htm" );
})

app.post('/register', passport.authenticate('local-signup', {
		successRedirect : '/login', // redirect to the secure profile section
		failureRedirect : '/register', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}), function (req, res) {
	console.log(res);
	} );



app.get('/process_get', function (req, res) {
   // Prepare output in JSON format
   response = {
      first_name:req.query.first_name,
      last_name:req.query.last_name
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

var server = app.listen(process.env.PORT, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)

})

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
