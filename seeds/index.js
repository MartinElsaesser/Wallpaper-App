const mongoose = require("mongoose");
require('dotenv').config();
const Wallpaper = require("../models/Wallpaper");
const Comment = require("../models/Comment");
const fs = require("fs");
const absolutePath = require("path").join.bind(null, __dirname);
const { v4: uuidv4 } = require('uuid');

mongoose.connect(process.env.DATABASE);

let user = "62094b79a0c1ec86f779967d";
const comments = [
	{
		user,
		text: "Really beautiful, indeed"
	},
	{
		user,
		text: "Great wallpaper, loving it."
	},
	{
		user,
		text: "This picture looks stunning"
	},
	{
		user,
		text: "Great pic, my friend"
	},
	{
		user,
		text: "I have seen better things"
	},
	{
		user,
		text: "I love nature"
	},
];

let wallpapers = [
	{
		user,
		fileName: "amoled-phone.jpg",
		path: "",
		fileExtension: "jpg",
		description: "AMOLED Mountains",
		device: "phone",
		comments: [0]
	},
	{
		user,
		fileName: "brick-wall.jpg",
		path: "",
		fileExtension: "jpg",
		description: "Brick Wall",
		device: "tablet",
		comments: [1]
	},
	{
		user,
		fileName: "earth.jpg",
		path: "",
		fileExtension: "jpg",
		description: "Earth",
		device: "phone",
		comments: [2, 3, 4]
	},
	{
		user,
		fileName: "ford.jpg",
		path: "",
		fileExtension: "jpg",
		description: "Ford",
		device: "desktop",
		comments: [3]
	},
	{
		user,
		fileName: "lamborghini.jpg",
		path: "",
		fileExtension: "jpg",
		description: "Lamborghini",
		device: "tablet",
		comments: [4]
	},
	{
		user,
		fileName: "landscape.jpg",
		path: "",
		fileExtension: "jpg",
		description: "Mountains",
		device: "desktop-wide",
		comments: [5]
	}
]

function populateImages() {
	// delete all images in /public/images
	try {
		fs.rmSync(absolutePath("../public/images"), { recursive: true })
	} catch (error) { }
	// recreate foler /public/images
	fs.mkdirSync(absolutePath("../public/images"));

	// move no-image
	const sourceImage = absolutePath("./images/no-image.png");
	const destinationImage = absolutePath("../public/images/no-image.png");
	fs.copyFileSync(sourceImage, destinationImage);

	return wallpapers.map(wallpaper => {
		// change image file names to use uuids (so all are unique)
		const [_, extension] = wallpaper.fileName.split(".");
		const uuid = uuidv4();
		const imageName = `${uuid}.${extension}`;

		// move images from /seeds/images to /public/images
		const sourceImage = absolutePath(`./images/${wallpaper.fileName}`);
		const destinationImage = absolutePath(`../public/images/${imageName}`);
		fs.copyFileSync(sourceImage, destinationImage);

		// update wallpaper image properties
		wallpaper.fileName = imageName;
		wallpaper.path = `/images/${imageName}`;
		return wallpaper;
	});
}

// push images to db
void async function intoDB() {
	await Wallpaper.deleteMany();
	await Comment.deleteMany();

	const insertedComments = await Comment.insertMany(comments);
	const wallpapersWithImages = populateImages();
	const wallpapersWithComments = wallpapersWithImages.map((wallpaper) => {
		wallpaper.comments = wallpaper.comments.map(commentI => insertedComments[commentI]);
		return wallpaper;
	})
	await Wallpaper.insertMany(wallpapersWithComments);
	mongoose.disconnect();
}()