/* jshint node: true, mocha: true */
'use strict';

var mongoose = require('mongoose');
var i18n = require('i18n');
var should = require('should');

var helper = require('../helper');
var i18nMongooseError = new(require('../../index'))();

i18n.configure({
	locales: ['de'],
	defaultLocale: 'de',
	directory: './locales'
});

i18n.setLocale('de');

module.exports = function() {

	describe('Message', function() {
		afterEach(helper.afterEach);

		it('should parse default string errors correctly', function(done) {
			// required error
			var Model = mongoose.model('Model', helper.createStringSchema());
			new Model().save(function(err) {
				err = i18nMongooseError.parseValidationError(err, i18n);
				should.exist(err);
				Object.keys(err).length.should.be.exactly(1);
				should.exist(err.value);
				err.value.type.should.equal('required');
				err.value.message.should.equal('error.required');
				should.equal(err.value.value, undefined);

				// minlength error
				new Model({
					value: 'ab'
				}).save(function(err) {
					err = i18nMongooseError.parseValidationError(err, i18n);
					should.exist(err);
					Object.keys(err).length.should.be.exactly(1);
					should.exist(err.value);
					err.value.type.should.equal('minlength');
					err.value.message.should.equal('error.minlength.3');
					err.value.value.should.equal('ab');

					// maxlength error
					new Model({
						value: 'abcdefghijk'
					}).save(function(err) {
						err = i18nMongooseError.parseValidationError(err, i18n);
						should.exist(err);
						Object.keys(err).length.should.be.exactly(1);
						should.exist(err.value);
						err.value.type.should.equal('maxlength');
						err.value.message.should.equal('error.maxlength.10');
						err.value.value.should.equal('abcdefghijk');

						// cast error
						new Model({
							value: {}
						}).save(function(err) {
							err = i18nMongooseError.parseValidationError(err, i18n);
							should.exist(err);
							Object.keys(err).length.should.be.exactly(1);
							should.exist(err.value);
							err.value.type.should.equal('cast');
							err.value.message.should.equal('error.cast');

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
				err = i18nMongooseError.parseValidationError(err, i18n);
				should.exist(err);
				Object.keys(err).length.should.be.exactly(1);
				should.exist(err.value);
				err.value.type.should.equal('regexp');
				err.value.message.should.equal('error.model.value.regexp');
				err.value.value.should.equal('1234');

				done();
			});
		});

		it('should parse enum string errors correctly', function(done) {
			// match error
			var Model = mongoose.model('Model', helper.createStringEnumSchema());
			new Model({
				value: 'invalid'
			}).save(function(err) {
				err = i18nMongooseError.parseValidationError(err, i18n);
				should.exist(err);
				Object.keys(err).length.should.be.exactly(1);
				should.exist(err.value);
				err.value.type.should.equal('enum');
				err.value.message.should.equal('error.model.value.enum');
				err.value.value.should.equal('invalid');

				done();
			});
		});

		it('should parse default number errors correctly', function(done) {

			// required error
			var Model = mongoose.model('Model', helper.createNumberSchema());
			new Model().save(function(err) {
				err = i18nMongooseError.parseValidationError(err, i18n);
				should.exist(err);
				Object.keys(err).length.should.be.exactly(1);
				should.exist(err.value);
				err.value.type.should.equal('required');
				err.value.message.should.equal('error.required');
				should.equal(err.value.value, undefined);

				// min error
				new Model({
					value: -1
				}).save(function(err) {
					err = i18nMongooseError.parseValidationError(err, i18n);
					should.exist(err);
					Object.keys(err).length.should.be.exactly(1);
					should.exist(err.value);
					err.value.type.should.equal('min');
					err.value.message.should.equal('error.min.0');
					err.value.value.should.equal(-1);

					// max error
					new Model({
						value: 11
					}).save(function(err) {
						err = i18nMongooseError.parseValidationError(err, i18n);
						should.exist(err);
						Object.keys(err).length.should.be.exactly(1);
						should.exist(err.value);
						err.value.type.should.equal('max');
						err.value.message.should.equal('error.max.10');
						err.value.value.should.equal(11);

						// cast error
						new Model({
							value: {}
						}).save(function(err) {
							err = i18nMongooseError.parseValidationError(err, i18n);
							should.exist(err);
							Object.keys(err).length.should.be.exactly(1);
							should.exist(err.value);
							err.value.type.should.equal('cast');
							err.value.message.should.equal('error.cast');

							done();
						});
					});
				});
			});
		});

		it('should parse custom validation errors correctly', function(done) {
			var Model = mongoose.model('Model', helper.createCustomValidatorSchema());
			new Model({
				value: '1234'
			}).save(function(err) {
				err = i18nMongooseError.parseValidationError(err, i18n);
				should.exist(err);
				Object.keys(err).length.should.be.exactly(1);
				should.exist(err.value);
				err.value.type.should.equal('custom');
				err.value.message.should.equal('error.model.value.custom');
				err.value.value.should.equal('1234');

				done();
			});
		});

		it('should parse multiple errors correctly', function(done) {
			var Model = mongoose.model('Model', helper.createMultipleValidatorSchema());
			new Model().save(function(err) {
				err = i18nMongooseError.parseValidationError(err, i18n);
				should.exist(err);
				Object.keys(err).length.should.be.exactly(2);
				should.exist(err.string);
				err.string.type.should.equal('required');
				err.string.message.should.equal('error.required');
				should.equal(err.string.value, undefined);
				should.exist(err.number);
				err.number.type.should.equal('required');
				err.number.message.should.equal('error.required');
				should.equal(err.number.value, undefined);

				done();
			});
		});

		it('should parse unique errors correctly', function(done) {
			var Model = mongoose.model('Model', helper.createUniqueSchema());
			new Model({
				value: 'test'
			}).save(function(err) {
				should.not.exist(err);

				new Model({
					value: 'test'
				}).save(function(err) {
					err = i18nMongooseError.parseUniqueError(err, i18n);
					should.exist(err);
					Object.keys(err).length.should.be.exactly(1);
					should.exist(err.value);
					err.value.type.should.equal('unique');
					err.value.message.should.equal('error.unique');
					err.value.value.should.equal('test');

					done();
				});
			});
		});

		it('should have the correct prefix', function(done) {
			var Model = mongoose.model('Model', helper.createStringSchema());
			new Model().save(function(err) {
				err = new(require('../../index'))({
					prefix: 'err'
				}).parseValidationError(err, i18n);
				err.value.message.should.equal('err.required');

				done();
			});
		});
	});
};
