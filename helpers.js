const moment = require("moment");


function select(variable, value) {
	return variable === value ? "selected" : "";
}

module.exports = {
	moment,
	select
}