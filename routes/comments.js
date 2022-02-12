const express = require("express");
const { validateComment } = require("../middleware");
const router = express.Router({ mergeParams: true });
const Comment = require("../models/Comment");
const Wallpaper = require("../models/Wallpaper");
const { wrap } = require("../utils");

router.post("/", validateComment, wrap(async (req, res) => {
	const { comment: commentData } = req.body;
	const wallpaper = await Wallpaper.findById(req.params.wallpaperId);
	const comment = new Comment(commentData);
	wallpaper.comments.push(comment);
	await Promise.all([comment.save(), wallpaper.save()]);
	res.redirect(`/wallpapers/${req.params.wallpaperId}`)
}));
router.delete("/:id", wrap(async (req, res) => {
	await Wallpaper.findByIdAndUpdate(req.params.wallpaperId, { $pull: { comments: req.params.id } })
	await Comment.findByIdAndDelete(req.params.id);
	res.redirect(`/wallpapers/${req.params.wallpaperId}`)
}));

// /wallpapers/:wallpaperId/comments
module.exports = router;