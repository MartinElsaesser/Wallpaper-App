const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	text: {
		type: String,
		required: true,
	}
});

module.exports = mongoose.model("Comment", commentSchema);