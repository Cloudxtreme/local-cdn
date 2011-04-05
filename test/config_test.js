var assert = require('assert');

var cdn = require('../index');

var config = cdn.config.fromFileSync(__dirname + '/../example/config.json');

console.log(config);

