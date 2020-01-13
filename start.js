const concurrently = require('concurrently');
var path = require('path');

concurrently([path.join(__dirname, './serv.js'), path.join(__dirname, './app.js')]);