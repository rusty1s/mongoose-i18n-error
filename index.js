/* jshint node: true */
'use strict';

module.exports = function(options) {
	this.prefix = (options || {}).prefix ||  'error.';

	this.handler = function(handler) {
		var self = this;

		return function(err, req, res, next) {
			if (!err) return next(err);
			if (typeof res.__ !== 'function') {
				console.error('no i18n.__ function found.');
				return next(err);
			}

			var i18nErr = self.parseValidationError(err, res.__) ||  self.parseUniqueError(err, res.__);

			if (i18nErr) return handler(i18nErr, req, res, next);
			else return next(err);
		};
	};

	this.parseValidationError = function(err, __) {
		if (!err) return null;
		if (err.name !== 'ValidationError') return null;

		var result = {};

		for (var key in err.errors) {
			var error = err.errors[key];
			var type = error.kind;
			var condition;
			var message = this.prefix;

			// cast error
			if (error.name === 'CastError') {
				type = 'cast';
				message += type;
			}

			// match or enum error
			else if (type === 'regexp' ||  type === 'enum') {
				var model = /(.*)\svalidation\sfailed/.exec(err.message)[1].toLowerCase();
				message += model + '.' + key + '.' + type;
			}

			// custom validation error
			else if (type.match(/user defined/)) {
				type = error.message.split(/\./g).reverse()[0];
				message += error.message;
			}

			// all other errors
			else {
				if (error.properties) condition = error.properties[type];
				message += type;
			}

			result[key] = {
				type: type,
				message: __(message, condition),
				value: error.value
			};
		}

		return result;
	};

	this.parseUniqueError = function(err, __) {
		if (!err) return null;
		if (err.name !== 'MongoError') return null;
		if (err.code !== 11000 && err.code !== 11001) return null;

		var matches = /index:\s.*\.\$(.*)_1\sdup key:\s\{\s:\s"(.*)"\s\}/.exec(err.message);

		var result = {};
		result[matches[1]] = {
			type: 'unique',
			message: __(this.prefix + 'unique'),
			value: matches[2]
		};
		return result;
	};
};
