const express 			= require("express");
const passport 			= require("passport");
const GithubStrategy 	= require("passport-github").Strategy;
const session 			= require("express-session");
const morgan            = require("morgan");

const config            = require.main.require("./lib/config/config");
const cache             = require.main.require("./lib/cache/cache");

const app 				= express();

passport.use(new GithubStrategy({
	clientID: config.GH_CLIENT_ID,
	clientSecret: config.GH_CLIENT_SECRET,
	callbackURL: "http://localhost:3000/api/auth/github/callback"
}, function(accessToken, refreshToken, gitHubProfile, done) {
	console.log("got github profile")
    return done(null, gitHubProfile);
}));

// Express and Passport Session
app.use(morgan("combined"));
app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,              // TODO check this is correct for pg
    saveUninitialized: false    // TODO check if this is correct too
}));
app.use(passport.initialize());
app.use(passport.session());    // this must be called after "express-session"

passport.serializeUser(function(user, done) {
	console.log("serializeUser called")
    // placeholder for custom user serialization
    
    //1 check if user in is db and add if not.
    //2 add user to cache    

    done(null, user);
});

// this is called on every request
passport.deserializeUser(function(user, done) {
	console.log("deserializeUser called")
    // placeholder for custom user deserialization.
	// maybe you are getoing to get the user from mongo by id?
	// null is for errors
	
    // check for user in cache, return if we have them
    // if not in cache then get the user from the db

    done(null, user);
});

// we will call this to start the GitHub Login process
app.get("/api/auth/github", passport.authenticate("github"));

// This step is where the token comes from
app.get("/api/auth/github/callback", passport.authenticate("github", { 
    failureRedirect: "/login",
    successRedirect: "/"
}), function(){
    console.log("token callback invoked")
});

app.get("/", function (req, res) {
    res.send(`<ul>
        <li>This is a public page</li>
        <li><a href="/private">This</a> is a link to a private page</li>         
    </ul>`);
});

app.get("/login", function (req, res) {
	let html = `<ul>
		<li><a href="/api/auth/github">GitHub Login</a></li>
		<li><a href="/logout">logout</a></li>
	</ul>`;

	// dump the user for debugging
	if (req.isAuthenticated()) {
		html += "<p>authenticated as user:</p>"
		html += "<pre>" + JSON.stringify(req.user, null, 4) + "</pre>";
	} else {
        html += "<p>Auth failure</p>"
    }

	res.send(html);
});

app.get("/logout", function(req, res){
	console.log("logging out");
	req.logout();
	res.redirect("/");
});

// Simple route middleware to ensure user is authenticated.
//  Use this route middleware on any resource that needs to be protected.  If
//  the request is authenticated (typically via a persistent login session),
//  the request will proceed.  Otherwise, the user will be redirected to the
//  login page.
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect("/login")
}

app.get("/private", ensureAuthenticated, function(req, res) {
	const html = "<pre>" + JSON.stringify(req.user, null, 4) + "</pre>";
      
    res.send(html);
});

const server = app.listen(3000, function () {
	console.log("\nExample app listening at http://%s:%s\n",
	        server.address().address, server.address().port);
});
