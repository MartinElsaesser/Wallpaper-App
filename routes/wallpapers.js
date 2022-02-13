const express = require("express");
const router = express.Router();
const Wallpaper = require("../models/Wallpaper");
const { wrap, FlashError } = require("../utils");
const uploadPictures = require("../multer_config");
const absolutePath = require("path").join.bind(null, __dirname);
const fs = require("fs");
const { promisify } = require("util");
const rm = promisify(fs.rm);
const { validateWallpaperCreate, validateWallpaperEdit, validateImage } = require("../middleware");



function buildSearchQuery(query) {
	const devices = ["phone", "tablet", "desktop", "desktop-wide"];
	const { device, description } = query;
	const search = {
		...(devices.includes(device) && { device }),
		...(description && {
			description: {
				$regex: new RegExp(`${description}`, "i")
			}
		}
		)
	}
	return search;
}

router.get("/", wrap(async (req, res) => {
	// build search querry
	const query = buildSearchQuery({ ...req.query });
	const wallpapers = await Wallpaper.find(query);
	const title = "View wallpapers";
	res.render("wallpapers/index", { wallpapers, title });
}));
router.get("/new", wrap(async (req, res) => {
	const title = "Upload wallpaper";
	res.render("wallpapers/new", { title });
}));
router.get("/:id", wrap(async (req, res) => {
	const wallpaper = await Wallpaper.findById(req.params.id).populate("comments");
	const title = `${wallpaper.description}`;
	res.render("wallpapers/show", { wallpaper, title });
}));
router.get("/:id/edit", wrap(async (req, res) => {
	const wallpaper = await Wallpaper.findById(req.params.id).populate("comments");
	const title = `${wallpaper.description}`;
	res.render("wallpapers/edit", { wallpaper, title });
}));
router.get("/:id/download", wrap(async (req, res) => {
	const wallpaper = await Wallpaper.findById(req.params.id);

	const path = absolutePath(`../public/images/${wallpaper.fileName}`);
	res.set('Content-Type', `image/${wallpaper.fileExtension}`)
	res.download(path, `${wallpaper.description}.${wallpaper.fileExtension}`);
}));



// TODO: 
// * validate that form only submits images
// * validate form fields
router.post("/", validateWallpaperCreate, uploadPictures.single("file"), validateImage, wrap(async (req, res) => {
	const { wallpaper } = req.body;
	const { filename, mimetype } = req.file;
	const [fileType, fileExtension] = mimetype.split("/");

	wallpaper.fileName = filename;
	wallpaper.fileExtension = fileExtension;
	wallpaper.path = `/images/${filename}`;
	console.log(wallpaper);
	await Wallpaper.create(wallpaper);
	res.redirect("/wallpapers");
}));

router.put("/:id", validateWallpaperEdit, uploadPictures.single("file"), wrap(async (req, res) => {
	const { wallpaper } = req.body;
	// override picture options, if new one was provided
	if (req.file) {
		const { filename, mimetype } = req.file;
		const [fileType, fileExtension] = mimetype.split("/");
		if (fileType !== "image") throw new FlashError("Your file must be an image", `/wallpapers/${req.params.id}/edit`);

		wallpaper.fileName = filename;
		wallpaper.fileExtension = fileExtension;
		wallpaper.path = `/images/${filename}`;
	}
	const oldWallpaper = await Wallpaper.findByIdAndUpdate(req.params.id, wallpaper, { new: false });
	// delete old picture, if new one was provided
	if (req.file) rm(absolutePath(`../public/images/${oldWallpaper.fileName}`));
	res.redirect(`/wallpapers/${req.params.id}`)
}));


router.delete("/:id", wrap(async (req, res) => {
	await Wallpaper.findByIdAndDelete(req.params.id);
	res.redirect("/wallpapers");
}));

// /wallpapers
module.exports = router;