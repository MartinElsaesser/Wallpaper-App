const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const fs = require("fs");
const { promisify } = require("util");
const rm = promisify(fs.rm);
const absolutePath = require("path").join.bind(null, __dirname);

const wallpaperSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	path: {
		type: String,
		required: true
	},
	fileName: {
		type: String,
		required: true
	},
	fileExtension: {
		type: String,
		required: true,
		enum: ["tif", "tiff", "bmp", "jpg", "jpeg", "gif", "png"]
	},
	description: {
		type: String,
		required: true
	},
	device: {
		type: String,
		required: true,
		enum: ["phone", "desktop", "desktop-wide", "tablet"]
	},
	comments: [
		{
			type: Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

wallpaperSchema.post("findOneAndDelete", async (wallpaper) => {
	await mongoose.model("Comment").deleteMany({ _id: { $in: wallpaper.comments } });
	await rm(absolutePath(`../public/images/${wallpaper.fileName}`));
});

module.exports = mongoose.model("Wallpaper", wallpaperSchema);