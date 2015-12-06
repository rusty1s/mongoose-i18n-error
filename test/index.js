/* jshint node: true, mocha: true */
'use strict';

var mongoose = require('mongoose');
var express = require('express');
var i18n = require('i18n');

mongoose.connect('mongodb://localhost/mongoose-i18n-error');
mongoose.connection.on('error', function() {
	throw new Error('Unable to connect to database.');
});

var app = express();
var server = app.listen(3000);

i18n.configure({
	locales: ['en'],
	directory: './locales'
});

app.use(i18n.init);

describe('Mongoose I18n Error', function() {
	require('./tests/message')(i18n);
	require('./tests/express')(app);
});

server.close();
