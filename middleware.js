const { comments, wallpapers } = require('./validateSchemas');
const h = require("./helpers");
const { FlashError, wrap } = require('./utils');
const absolutePath = require("path").join.bind(null, __dirname);
const fs = require("fs");
const { promisify } = require("util");
const Wallpaper = require('./models/Wallpaper');
const Comment = require('./models/Comment');
const rm = promisify(fs.rm);

function validateComment(req, res, next) {
	const { error, value } = comments.validate(req.body.comment);
	let message = "Comment must be 10 characters or longer";
	if (error) next(new FlashError(message, `/wallpapers/${req.params.wallpaperId}`));
	next();
}
function validateImage(req, res, next) {
	if (!req.file) next(new FlashError("Either no or not an image sent", "/wallpapers/new"));
	next();
}
function validateWallpaperCreate(req, res, next) {
	const wallpaper = { ...req.body.wallpaper };
	const { error, value } = wallpapers.validate(wallpaper);
	let message = "Check your inputs";
	console.log(req.file);
	if (error) {
		if (req.file) rm(absolutePath(`./public/images/${req.file.filename}`));
		next(new FlashError(message, "/wallpapers/new"));
	}
	next();

}
function validateWallpaperEdit(req, res, next) {
	const wallpaper = { ...req.body.wallpaper };
	const { error, value } = wallpapers.validate(wallpaper);
	let message = "Check your inputs";
	if (error) {
		if (req.file) rm(absolutePath(`./public/images/${req.file.filename}`));
		next(new FlashError(message, `/wallpapers/${req.params.id}/edit`));
	}
	next();
}

function isLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		req.session.returnUrl = req.originalUrl;
		req.session.returnMethod = req.method;
		console.log({ url: req.originalUrl, method: req.method });
		req.flash("error", "You need to be logged in to do this");
		return res.redirect("/login")
	}
	next();
}
const isWallpaperAuthor = wrap(async (req, res, next) => {
	const { wallpaperId } = req.params;
	const wallpaper = await Wallpaper.findById(wallpaperId);
	if (!wallpaper.user.equals(req.user._id)) {
		throw new FlashError("You do not have permission to do that!", `/wallpapers/${wallpaperId}`)
	}
	next();
});
const isCommentAuthor = wrap(async (req, res, next) => {
	const { id, wallpaperId } = req.params;
	const comment = await Comment.findById(id);
	if (!comment.user.equals(req.user._id)) {
		throw new FlashError("You do not have permission to do that!", `/wallpapers/${wallpaperId}`)
	}
	next();
});
function deleteRedirect(req, res, next) {
	delete req.session.returnUrl;
	delete req.session.returnMethod;
	next();
}

function _icon(name, type = "solid") {
	return `<i class="fa-${type} fa-${name}"></i>`;
}

function setLocals(req, res, next) {
	res.locals.h = h;
	res.locals.errors = req.flash("error");
	res.locals.successes = req.flash("success");
	res.locals.url = req.path;
	res.locals.query = { ...req.query };
	res.locals.user = req.user;
	let isLoggedIn = req.isAuthenticated();
	res.locals.routes = [
		{ name: "Home", href: "/", match: /^\/$/, render: true },
		{ name: `Wallpapers`, href: "/wallpapers", match: /^\/wallpapers\/?$/, render: true },
		{ name: `Login ${_icon("arrow-right-to-bracket")}`, href: "/login", match: /^\/login\/?$/, render: !isLoggedIn },
		{ name: `Register  ${_icon("right-to-bracket")}`, href: "/register", match: /^\/register\/?$/, render: !isLoggedIn },
		{ name: `Logout  ${_icon("arrow-right-from-bracket")}`, href: "/logout", match: /^\/logout\/?$/, render: isLoggedIn },
		{ name: `Upload new Wallpaper  ${_icon("image")}`, href: "/wallpapers/new", match: /^\/wallpapers\/new\/?$/, render: isLoggedIn },
	]
	res.locals.title = "Wallpapers";
	req.login = req.logIn = promisify(req.login);
	next();
}

module.exports = {
	validateComment,
	setLocals,
	validateWallpaperCreate,
	validateWallpaperEdit,
	validateImage,
	isLoggedIn,
	isWallpaperAuthor,
	isCommentAuthor,
	deleteRedirect
}