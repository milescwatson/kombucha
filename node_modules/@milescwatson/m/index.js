var fetch = require('./functions/fetch.js');
var sql = require('./functions/sql.js');

var helloWorld = function(){
	console.log('Hello world, from the m utility function!')
}

exports.helloWorld = helloWorld;
exports.fetch = fetch;
exports.sql = sql;
