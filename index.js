/* jshint node: true */
'use strict';

module.exports = {

	// throw error if i18n

	parseValidationError: function(err) {
		if (!err ||  err.name !== 'ValidationError') return err;

		var prefix = 'error';
		var result = {};

		var errors = err.errors;
		Object.keys(errors).forEach(function(key) {
			var error = errors[key];
			var type = error.kind;
			var message = prefix;
			var value = error.value;

			// cast error
			if (error.name === 'CastError') {
				type = 'cast';
				message += '.cast';
			}

			// match or enum error
			else if (type === 'regexp' ||  type === 'enum') {
				var model = err.message.substring(0, err.message.lastIndexOf(' validation failed')).toLowerCase();
				message += '.' + model + '.' + key + '.' + errors[key].kind;
			}

			// custom validation error
			else if (type.match(/user defined/)) {
				type = error.message;
				message += '.' + error.message;
			}

			// all other errors
			else {
				var condition = error.properties[type];
				message += '.' + type + (condition ? ', ' + condition : '');
			}

			result[key] = {
				type: type,
				message: message,
				value: value
			};
		});

		return result;
	}
};
