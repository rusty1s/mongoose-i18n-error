/* jshint node: true, mocha: true */
'use strict';

var mongoose = require('mongoose');
var i18n = require('i18n');
var request = require('supertest');

var helper = require('../helper');
var i18nMongooseError = new(require('../../index'))();

module.exports = function(app) {

	describe('I18n', function() {
		afterEach(helper.afterEach);

		i18n.configure({
			locales: ['en'],
			directory: './locales'
		});

		app.use(i18n.init);

		it('should print a localized error message', function(done) {
			var Model = mongoose.model('Model', helper.createStringSchema());
			app.post('/i18n/1', function(req, res, next) {
				new Model().save(function(err) {
					if (err) return next(err);
					res.sendStatus(200);
				});
			});

			app.use(i18nMongooseError.handler(function(err, req, res) {
				res.status(422).json(err);
			}));

			request(app).post('/i18n/1').expect(422).end(function(err, res) {
				res.body.value.message.should.equal('is required');

				done();
			});
		});

		it('should print a localized minlength error message', function(done) {
			var Model = mongoose.model('Model', helper.createStringSchema());
			app.post('/i18n/2', function(req, res, next) {
				new Model({
					value: 'ab'
				}).save(function(err) {
					if (err) return next(err);
					res.sendStatus(200);
				});
			});

			app.use(i18nMongooseError.handler(function(err, req, res) {
				res.status(422).json(err);
			}));

			request(app).post('/i18n/2').expect(422).end(function(err, res) {
				res.body.value.message.should.equal('needs a minimum length of 3');

				done();
			});
		});

		it('should print a localized min error message', function(done) {
			var Model = mongoose.model('Model', helper.createNumberSchema());
			app.post('/i18n/3', function(req, res, next) {
				new Model({
					value: -1
				}).save(function(err) {
					if (err) return next(err);
					res.sendStatus(200);
				});
			});

			app.use(i18nMongooseError.handler(function(err, req, res) {
				res.status(422).json(err);
			}));

			request(app).post('/i18n/3').expect(422).end(function(err, res) {
				res.body.value.message.should.equal('needs a number greater than or equal to 0');

				done();
			});
		});
	});
};
