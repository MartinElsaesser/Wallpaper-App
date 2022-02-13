const Joi = require('joi');

const comments = Joi.object({
	text: Joi.string()
		.min(10)
		.required()
});

const wallpapers = Joi.object({
	description: Joi.string()
		.min(5)
		.required(),
	device: Joi.string()
		.valid("phone", "desktop", "desktop-wide", "tablet")
		.required(),
});

module.exports = {
	comments,
	wallpapers
}
