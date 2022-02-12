class FlashError extends Error {
	constructor(message, redirect) {
		super();
		this.message = message;
		this.redirect = redirect;
	}
}
module.exports = FlashError;