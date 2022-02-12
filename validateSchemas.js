const Joi = require('joi');

const comments = Joi.object({
	text: Joi.string()
		.min(10)
		.required()
});

module.exports = {
	comments
}
