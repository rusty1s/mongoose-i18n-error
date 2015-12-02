/* jshint node: true */
'use strict';

module.exports = {

	// throw error if i18n

	parseValidationError: function(err, i18n) {
		if (!err ||  err.name !== 'ValidationError') return err;

		var prefix = 'error';
		var result = {};

		var errors = err.errors;
		Object.keys(errors).forEach(function(key) {
			var error = errors[key];
			var type = error.kind;
			var condition;
			var message = prefix + '.';
			var value = error.value;

			// cast error
			if (error.name === 'CastError') {
				type = 'cast';
				message += 'cast';
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
				message: i18n(message, condition),
				value: value
			};
		});

		return result;
	},

	parseUniqueError: function(err, i18n) {
		if (!err ||  err.name !== 'MongoError' || !(err.code === 11000 ||  err.code === 11001)) return err;

		var prefix = 'error';
		var result = {};

		var regex = /index:\s*.+?\.\$(\S*)_.+\s*dup key:\s*\{.*?:\s*"(.*)"\s*\}/;
		var matches = regex.exec(err.message);
		var key = matches[1];
		var value = matches[2];

		result[key] = {
			type: 'unique',
			message: i18n(prefix + '.unique'),
			value: value
		};

		return result;
	}
};
