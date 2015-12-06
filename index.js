/* jshint node: true */
'use strict';

var i18nError = module.exports = function(options) {
	options = options || {};
	this.prefix = options.prefix ||  this.prefix;
};

i18nError.prototype = {
	prefix: 'error',

	handler: function(handler) {
		var self = this;

		return function(err, req, res, next) {
			if (!err) return next(err);

			var i18n;
			if (typeof res.__ === 'function') i18n = res;
			else if (req.i18n && typeof req.i18n.__ === 'function') i18n = req.i18n;
			else throw 'no i18n.__ function found.';

			var mongooseErr = self.parseValidationError(err, i18n);
			if (!mongooseErr) mongooseErr = self.parseUniqueError(err, i18n);
			if (mongooseErr) {
				return handler(mongooseErr, req, res, next);
			} else return next(err);
		};
	},

	parseValidationError: function(err, i18n) {
		if (!err ||  err.name !== 'ValidationError') return null;

		var self = this;
		var result = {};

		var errors = err.errors;
		Object.keys(errors).forEach(function(key) {
			var error = errors[key];
			var type = error.kind;
			var condition;
			var message = self.prefix + '.';
			var value = error.value;

			// cast error
			if (error.name === 'CastError') {
				type = 'cast';
				message += type;
			}

			// match or enum error
			else if (type === 'regexp' ||  type === 'enum') {
				var model = err.message.substring(0, err.message.lastIndexOf(' validation failed')).toLowerCase();
				message += model + '.' + key + '.' + type;
			}

			// custom validation error
			else if (type.match(/user defined/)) {
				var array = error.message.split(/\./g);
				type = array[array.length - 1];
				message += error.message;
			}

			// all other errors
			else {
				if (error.properties) condition = error.properties[type];
				message += type;
			}

			result[key] = {
				type: type,
				message: i18n.__(message, condition),
				value: value
			};
		});

		return result;
	},

	parseUniqueError: function(err, i18n) {
		if (!err ||  err.name !== 'MongoError' || !(err.code === 11000 ||  err.code === 11001)) return null;

		var result = {};

		var regex = /index:\s*.+?\.\$(\S*)_.+\s*dup key:\s*\{.*?:\s*"(.*)"\s*\}/;
		var matches = regex.exec(err.message);
		var key = matches[1];
		var value = matches[2];

		result[key] = {
			type: 'unique',
			message: i18n.__(this.prefix + '.unique'),
			value: value
		};

		return result;
	}
};
