const express = require("express");
const router = express.Router();
const Wallpaper = require("../models/Wallpaper");
const { wrap, FlashError, buildSearchQuery } = require("../utils");
const uploadPictures = require("../multer_config");
const absolutePath = require("path").join.bind(null, __dirname);
const fs = require("fs");
const { promisify } = require("util");
const rm = promisify(fs.rm);
const { validateWallpaperCreate, validateWallpaperEdit, validateImage, isLoggedIn, isWallpaperAuthor } = require("../middleware");

router.get("/", wrap(async (req, res) => {
	// build search querry
	const query = buildSearchQuery({ ...req.query });
	const wallpapers = await Wallpaper.find(query);
	const title = "View wallpapers";
	res.render("wallpapers/index", { wallpapers, title });
}));
router.get("/new", isLoggedIn, wrap(async (req, res) => {
	const title = "Upload wallpaper";
	res.render("wallpapers/new", { title });
}));
router.get("/:wallpaperId", wrap(async (req, res) => {
	const wallpaper = await Wallpaper
		.findById(req.params.wallpaperId)
		.populate("user")
		.populate({ path: "comments", populate: { path: "user" } });
	const title = `${wallpaper.description}`;
	res.render("wallpapers/show", { wallpaper, title });
}));
router.get("/:wallpaperId/edit", isLoggedIn, isWallpaperAuthor, wrap(async (req, res) => {
	const wallpaper = await Wallpaper.findById(req.params.wallpaperId).populate("comments");
	const title = `${wallpaper.description}`;
	res.render("wallpapers/edit", { wallpaper, title });
}));
router.get("/:wallpaperId/download", wrap(async (req, res) => {
	const wallpaper = await Wallpaper.findById(req.params.wallpaperId);

	const path = absolutePath(`../public/images/${wallpaper.fileName}`);
	res.set('Content-Type', `image/${wallpaper.fileExtension}`)
	res.download(path, `${wallpaper.description}.${wallpaper.fileExtension}`);
}));

router.post("/", isLoggedIn, uploadPictures.single("file"), validateWallpaperCreate, validateImage, wrap(async (req, res) => {
	const { wallpaper } = req.body;
	const { filename, mimetype } = req.file;
	const [fileType, fileExtension] = mimetype.split("/");

	wallpaper.fileName = filename;
	wallpaper.fileExtension = fileExtension;
	wallpaper.path = `/images/${filename}`;
	wallpaper.user = req.user._id;
	await Wallpaper.create(wallpaper);
	res.redirect("/wallpapers");
}));

router.put("/:wallpaperId", isLoggedIn, isWallpaperAuthor, validateWallpaperEdit, uploadPictures.single("file"), wrap(async (req, res) => {
	const { wallpaper } = req.body;
	// override picture options, if new one was provided
	if (req.file) {
		const { filename, mimetype } = req.file;
		const [fileType, fileExtension] = mimetype.split("/");
		if (fileType !== "image") throw new FlashError("Your file must be an image", `/wallpapers/${req.params.wallpaperId}/edit`);

		wallpaper.fileName = filename;
		wallpaper.fileExtension = fileExtension;
		wallpaper.path = `/images/${filename}`;
	}
	const oldWallpaper = await Wallpaper.findByIdAndUpdate(req.params.wallpaperId, wallpaper, { new: false });
	// delete old picture, if new one was provided
	if (req.file) rm(absolutePath(`../public/images/${oldWallpaper.fileName}`));
	res.redirect(`/wallpapers/${req.params.wallpaperId}`)
}));


router.delete("/:wallpaperId", isLoggedIn, isWallpaperAuthor, wrap(async (req, res) => {
	await Wallpaper.findByIdAndDelete(req.params.wallpaperId);
	res.redirect("/wallpapers");
}));

// /wallpapers
module.exports = router;