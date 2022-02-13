const Joi = require('joi');
const { comments, wallpapers } = require('./validateSchemas');
const h = require("./helpers");
const { FlashError } = require('./utils');

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
	const { error, value } = wallpapers.validate(req.body.wallpaper);
	let message = "Check your inputs";
	if (error) next(new FlashError(message, "/wallpapers/new"));
	next();

}
function validateWallpaperEdit(req, res, next) {
	const { error, value } = wallpapers.validate(req.body.wallpaper);
	let message = "Check your inputs";
	if (error) next(new FlashError(message, `/wallpapers/${req.params.id}/edit`));
	next();
}


function setLocals(req, res, next) {
	res.locals.h = h;
	res.locals.errors = req.flash("error");
	res.locals.successes = req.flash("success");
	res.locals.url = req.path;
	res.locals.query = { ...req.query };
	res.locals.routes = [
		{ name: "Home", href: "/", match: /^\/$/ },
		{ name: "Wallpapers", href: "/wallpapers", match: /^\/wallpapers\/?$/ },
		{ name: `Upload new Wallpapers <i class="fa-solid fa-plus"></i>`, href: "/wallpapers/new", match: /^\/wallpapers\/new\/?$/ },
	]
	res.locals.title = "Wallpapers"
	next();
}

module.exports = {
	validateComment,
	setLocals,
	validateWallpaperCreate,
	validateWallpaperEdit,
	validateImage
}