const mongoose = require("mongoose");
require('dotenv').config();
const Wallpaper = require("../models/Wallpaper");
const Comment = require("../models/Comment");
const fs = require("fs");
const absolutePath = require("path").join.bind(null, __dirname);
const { v4: uuidv4 } = require('uuid');

mongoose.connect(process.env.DATABASE);

const comments = [
	{
		text: "Really beautiful, indeed"
	},
	{
		text: "Great wallpaper, loving it."
	},
	{
		text: "This picture looks stunning"
	},
	{
		text: "Great pic, my friend"
	},
	{
		text: "I have seen better things"
	},
	{
		text: "I love nature"
	},
];

let wallpapers = [
	{
		fileName: "amoled-phone.jpg",
		path: "",
		fileExtension: "jpg",
		description: "AMOLED Mountains",
		device: "phone",
		comments: [0]
	},
	{
		fileName: "brick-wall.jpg",
		path: "",
		fileExtension: "jpg",
		description: "Brick Wall",
		device: "tablet",
		comments: [1]
	},
	{
		fileName: "earth.jpg",
		path: "",
		fileExtension: "jpg",
		description: "Earth",
		device: "phone",
		comments: [2, 3, 4]
	},
	{
		fileName: "ford.jpg",
		path: "",
		fileExtension: "jpg",
		description: "Ford",
		device: "desktop",
		comments: [3]
	},
	{
		fileName: "lamborghini.jpg",
		path: "",
		fileExtension: "jpg",
		description: "Lamborghini",
		device: "tablet",
		comments: [4]
	},
	{
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