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
	},

	createStringSchema: function() {
		return new mongoose.Schema({
			value: {
				type: String,
				required: true,
				minlength: 3,
				maxlength: 10
			}
		});
	},

	createStringMatchSchema: function() {
		return new mongoose.Schema({
			value: {
				type: String,
				match: /^[A-Z]+$/i
			}
		});
	},

	createStringEnumSchema: function() {
		return new mongoose.Schema({
			value: {
				type: String,
				enum: 'true false'.split(' ')
			}
		});
	},

	createNumberSchema: function() {
		return new mongoose.Schema({
			value: {
				type: Number,
				required: true,
				min: 0,
				max: 10
			}
		});
	},

	createMultipleSchema: function() {
		return new mongoose.Schema({
			string: {
				type: String,
				required: true,
				minlength: 3,
				maxlength: 10
			},
			number: {
				type: Number,
				required: true,
				min: 0,
				max: 10
			}
		});
	},

	createCustomValidatorSchema: function() {
		return new mongoose.Schema({
			value: {
				type: String,
				validate: {
					validator: function(v) {
						return /^[A-Z]+$/i.test(v);
					},
					message: 'custom'
				}
			}
		});
	}
};
