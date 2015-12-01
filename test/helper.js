/* jshint node: true */
'use strict';

var mongoose = require('mongoose');

module.exports = {

	afterEach: function(done) {
		for (var key in mongoose.connection.collections) {
			mongoose.connection.collections[key].remove();
		}

		mongoose.models = {};
		mongoose.modelSchemas = {};
		mongoose.connection.models = {};
		done();
	}
};
