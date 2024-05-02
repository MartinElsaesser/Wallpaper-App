const mongoose = require('mongoose');
const absolutePath = require("path").join.bind(null, __dirname);
require('dotenv').config({ path: absolutePath(".env") });

mongoose.connect(process.env.DATABASE);
mongoose.connection.on('error', (err) => {
	console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// initialize models
// require("./models/Comment");
// require("./models/Wallpaper");

const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
	console.log(`Running on: http://localhost:${server.address().port}`);
});
