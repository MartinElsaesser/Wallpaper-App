const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const { wrap, FlashError } = require("../utils");
const passport = require("passport");
const User = require("../models/User");

router.get("/login", (req, res) => {
	res.render("login");
});
router.get("/register", (req, res) => {
	res.render("register");
});
router.get("/logout", isLoggedIn, (req, res) => {
	req.logout();
	req.flash("success", "Successfully logged out");
	res.redirect("/wallpapers");
});

const login = passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" });
router.post("/login", login, wrap(async (req, res) => {
	req.flash("success", `Welcome back ${req.body.username}`);
	const redirectUrl = req.session.returnUrl || "/wallpapers";
	delete req.session.returnUrl;
	delete req.session.returnMethod;
	res.redirect(redirectUrl);
}));

router.post("/register", wrap(async (req, res) => {
	const { username, password, email } = req.body;
	console.log(req.body);
	let redirect = req.session.returnUrl || "/wallpapers";
	try {
		const newUser = new User({ username, email }); // try registering new user
		const user = await User.register(newUser, password);
		await req.login(user);
		delete req.session.returnUrl;
		delete req.session.returnMethod;
		req.flash("success", `Welcome ${username}`);
		res.redirect(redirect);
	} catch (error) {
		if (error?.message.startsWith("E11000")) error.message = `A user with email address ${email} is already registered.`
		throw new FlashError(error.message, "/register");
	}
}))

module.exports = router;