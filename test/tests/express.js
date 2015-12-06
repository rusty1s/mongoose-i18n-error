/* jshint node: true, mocha: true */
'use strict';

var mongoose = require('mongoose');
var request = require('supertest');
var should = require('should');

var helper = require('../helper');
var i18nMongooseError = new(require('../../index'))();

module.exports = function(app) {

	describe('Express', function() {
		afterEach(helper.afterEach);

		it('should print a localized validation error message', function(done) {
			var Model = mongoose.model('Model', helper.createStringSchema());
			app.post('/1', function(req, res, next) {
				new Model().save(function(err) {
					if (err) return next(err);
					res.sendStatus(200);
				});
			});

			app.use(i18nMongooseError.handler(function(err, req, res) {
				res.status(422).json(err);
			}));

			request(app).post('/1').expect(422).end(function(err, res) {
				res.body.value.message.should.equal('is required');

				done();
			});
		});

		it('should print a localized unique error message', function(done) {
			var Model = mongoose.model('Model', helper.createUniqueSchema());

			app.post('/2', function(req, res, next) {
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

			new Model({
				value: 'ab'
			}).save(function(err) {
				should.not.exist(err);

				request(app).post('/2').expect(422).end(function(err, res) {
					res.body.value.message.should.equal('already exists');

					done();
				});
			});
		});
	});
};
