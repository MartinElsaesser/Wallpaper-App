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
const h = require("./helpers");

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
app.use(flash());
app.use(setLocals);

app.get("/", (req, res) => {
	res.render("index");
});

const wallpapersRoutes = require("./routes/wallpapers");
const commentsRoutes = require("./routes/comments");
app.use("/wallpapers", wallpapersRoutes);
app.use("/wallpapers/:wallpaperId/comments", commentsRoutes);


const { FlashError } = require("./utils");
app.use((error, req, res, next) => {
	if (error instanceof FlashError) {
		req.flash("error", error.message);
		return res.redirect(error.redirect);
	}
	console.error(error);
	res.send("Error");
});

module.exports = app;