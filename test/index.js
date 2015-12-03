/* jshint node: true, mocha: true */
'use strict';

var express = require('express');
var mongoose = require('mongoose');

var app = express();
var server = app.listen(3000);

mongoose.connect('mongodb://localhost/mongoose-i18n-error');
mongoose.connection.on('error', function() {
	throw new Error('Unable to connect to database.');
});

describe('Mongoose I18n Error', function() {
	require('./tests/message')();
	require('./tests/i18n')(app);
	require('./tests/i18n-2')(app);
});

server.close();
