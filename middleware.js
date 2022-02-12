const Joi = require('joi');
const { comments } = require('./validateSchemas');
const h = require("./helpers");
const { FlashError } = require('./utils');

function validateComment(req, res, next) {
	const { error, value } = comments.validate(req.body.comment);
	let message = "Comment must be 10 characters or longer";
	if (error) throw new FlashError(message, `/wallpapers/${req.params.wallpaperId}`);
	next();
}

function setLocals(req, res, next) {
	res.locals.h = h;
	res.locals.errors = req.flash("error");
	res.locals.successes = req.flash("success");
	res.locals.url = req.path;
	res.locals.routes = [
		{ name: "Home", href: "/", match: /^\/$/ },
		{ name: "Wallpapers", href: "/wallpapers", match: /^\/wallpapers\/?$/ },
		{ name: "Upload new Wallpapers", href: "/wallpapers/new", match: /^\/wallpapers\/new\/?$/ },
	]
	res.locals.title = "Wallpapers"
	next();
}

module.exports = {
	validateComment,
	setLocals
}