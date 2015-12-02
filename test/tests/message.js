/* jshint node: true, mocha: true */
'use strict';

var mongoose = require('mongoose');
//var should = require('should');

var helper = require('../helper');
var i18nError = require('../../index');

module.exports = function() {

	describe('Message', function() {
		afterEach(helper.afterEach);

		it('should parse all default string errors correctly', function(done) {

			// required error
			var Model = mongoose.model('Model', helper.createStringSchema());
			new Model().save(function(err) {
				err = i18nError.parseValidationError(err);

				// minlength error
				new Model({
					value: 'ab'
				}).save(function(err) {
					err = i18nError.parseValidationError(err);

					// maxlength error
					new Model({
						value: 'abcdefghijk'
					}).save(function(err) {
						err = i18nError.parseValidationError(err);

						// cast error
						new Model({
							value: {}
						}).save(function(err) {
							err = i18nError.parseValidationError(err);

							done();
						});
					});
				});
			});
		});

		it('should parse match string errors correctly', function(done) {
			// match error
			var Model = mongoose.model('Model', helper.createStringMatchSchema());
			new Model({
				value: '1234'
			}).save(function(err) {
				err = i18nError.parseValidationError(err);

				done();
			});
		});

		it('should parse enum string errors correctly', function(done) {
			// match error
			var Model = mongoose.model('Model', helper.createStringEnumSchema());
			new Model({
				value: 'invalid'
			}).save(function(err) {
				err = i18nError.parseValidationError(err);

				done();
			});
		});

		it('should parse custom validation errors correctly', function(done) {
			// match error
			var Model = mongoose.model('Model', helper.createCustomValidatorSchema());
			new Model({
				value: '1234'
			}).save(function(err) {
				err = i18nError.parseValidationError(err);

				done();
			});
		});
	});
};
