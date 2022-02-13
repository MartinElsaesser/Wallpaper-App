const multer = require("multer");
const absolutePath = require("path").join.bind(null, __dirname);
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, absolutePath("public/images"))
	},
	filename: function (req, file, cb) {
		const [fileType, fileExtension] = file.mimetype.split("/");
		const uuid = uuidv4();
		cb(null, `${uuid}.${fileExtension}`)
	},
})
const uploadPictures = multer({
	storage,
	fileFilter: function (req, file, cb) {
		const [fileType, fileExtension] = file.mimetype.split("/");
		const isImage = fileType === "image";
		cb(null, isImage);
	}
});

module.exports = uploadPictures;