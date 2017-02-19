const express 			= require("express");
const passport 			= require("passport");
const GithubStrategy 	= require("passport-github").Strategy;
const session 			= require("express-session");
const morgan            = require("morgan");

const config            = require.main.require("./lib/config/config");
const cache             = require.main.require("./lib/cache/cache");
const db                = require.main.require("./lib/db/db");

const app 				= express();

passport.use(new GithubStrategy({
	clientID: config.GH_CLIENT_ID,
	clientSecret: config.GH_CLIENT_SECRET,
	callbackURL: "http://localhost:3000/api/auth/github/callback"
}, function(accessToken, refreshToken, ghUser, done) {
	console.log("got github profile")
	
	// in this part check the github profile id and look up the user by that,
	// trnasform the user.id into our id.

	// look into adding the user to the cache here as we will have had to look
	// look them up from the db at this point.

	// in what scenario is the session accessed and this callback not called.
    db.User.findOne({where: {idgh: ghUser.id}})
        .then(function(dbUser){
            if(dbUser) {
                console.log("Found user in db");
                done(null, ghUser); 
            } else {
                console.log("No user in db");
                return db.User.create({idgh: ghUser.id})
                    .then(function(newUser){
                        console.log("created user")
                        done(null, ghUser);
                    })
            }
        })
        .catch(function(err){
            done(err, null);
        });
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
    
    //1 check if user in is db throw if not as we should always have a user.
    //2 add user to cache    
    return cache.set(user.id, user)
		.then(function(cachedUser){
			done(null, cachedUser);
		})
		.catch(function(err){
			done(err, null);
		})
});

// this is called on every request
passport.deserializeUser(function(user, done) {
	console.log("deserializeUser called")
    // check for user in cache, return if we have them
    // if not in cache then get the user from the db
	cache.get(user.id)
		.catch(function(err) {
			// the cache returns and error if there is no user so instead we try
			// to get the user from the db.
			return db.User.findById(user.id).then(function(dbUser){ 
					return dbUser.toCache()
			});
		})
		.then(function(cachedUser){
			done(null, cachedUser);
		})
		.catch(function(err){
			done(err, null);
		})
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
