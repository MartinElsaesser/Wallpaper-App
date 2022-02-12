const express = require("express");
const router = express.Router();
const Wallpaper = require("../models/Wallpaper");
const { wrap } = require("../utils");
const multer = require("multer");
const absolutePath = require("path").join.bind(null, __dirname);
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const { promisify } = require("util");
const rm = promisify(fs.rm);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, absolutePath("../public/images"))
	},
	filename: function (req, file, cb) {
		const [type, fileExtension] = file.mimetype.split("/");
		const uuid = uuidv4();
		cb(null, `${uuid}.${fileExtension}`)
	}
})
const upload = multer({ storage });

router.get("/", wrap(async (req, res) => {
	const wallpapers = await Wallpaper.find();
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
router.get("/:id/update", wrap(async (req, res) => {
	const wallpaper = await Wallpaper.findById(req.params.id).populate("comments");
	const title = `${wallpaper.description}`;
	res.render("wallpapers/update", { wallpaper, title });
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
router.post("/", upload.single("file"), wrap(async (req, res) => {
	const { wallpaper } = req.body;
	const { filename, mimetype } = req.file;
	const [fileType, fileExtension] = mimetype.split("/");

	wallpaper.fileName = filename;
	wallpaper.fileExtension = fileExtension;
	wallpaper.path = `/images/${filename}`;
	await Wallpaper.create(wallpaper);
	res.redirect("/wallpapers");
}));

router.put("/:id", upload.single("file"), wrap(async (req, res) => {
	const { wallpaper } = req.body;
	// override picture options, if new one was provided
	if (req.file) {
		const { filename, mimetype } = req.file;
		const [fileType, fileExtension] = mimetype.split("/");

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