const express = require("express");
const app = express();
const engine = require('ejs-mate');
const absolutePath = require("path").join.bind(null, __dirname);
const methodOverride = require("method-override");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const { setLocals } = require("./middleware");
const passport = require("passport");
require("passport-local"); // YOU NEED THIS, DON'T DELETE IT OR IT WON'T WORK
const User = require("./models/User");

// view engine
app.engine('ejs', engine);
app.set('views', absolutePath("views"));
app.set('view engine', 'ejs');

app.use(express.static(absolutePath("public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser(process.env.SECRET));

const store = new MongoDBStore({
	uri: process.env.DATABASE,
	collection: 'sessions'
});
const sessionOpts = {
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true,
	store,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}
app.use(session(sessionOpts));

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(setLocals);


const wallpapersRoutes = require("./routes/wallpapers");
const commentsRoutes = require("./routes/comments");
const usersRoutes = require("./routes/users");
const { isLoggedIn, deleteRedirect } = require("./middleware");
app.get("/", deleteRedirect, (req, res) => {
	res.render("index");
});
app.use("/", usersRoutes);
app.use("/wallpapers", deleteRedirect, wallpapersRoutes);
app.use("/wallpapers/:wallpaperId/comments", deleteRedirect, isLoggedIn, commentsRoutes);


const { FlashError } = require("./utils");
app.use((error, req, res, next) => {
	if (error instanceof FlashError) {
		req.flash("error", error.message);
		return res.redirect(error.redirect);
	}
	console.error(error);
	res.render("Error");
});

module.exports = app;