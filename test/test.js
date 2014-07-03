describe('geojson-schema', function () {
	var mongoose;
	var chai;
	var sinon;
	var Schema;
	var types;
	var typeValidators;

	before(function (done) {
		var mockgoose = require('mockgoose');
		mongoose = new mockgoose(require('mongoose'));
		Schema = mongoose.Schema;
		chai = require('chai');
		sinon = require('sinon');
		mongoose.connect('url');
		mongoose.connection.on('open', done);

		types = [
			'LinearRing',
			'LineString',
			'MultiLineString',
			'MultiPoint',
			'MultiPolygon',
			'Polygon',
			'Point'
		];
		typeValidators = require('../lib/typeValidators').validators;
	});

	describe('schemas', function () {
		var exports;
		var schemaNames = [
			'Point',
			'MultiPoint',
			'LineString',
			'MultiLineString',
			'Polygon',
			'MultiPolygon'
		];
		var testSchema;
		var TestModel;
		var testObject;
		var opts;

		before(function () {
			exports = require('../GeoJSON');
			exports(mongoose);
//			var point = require('../lib/schemas/point');
//			point.register(mongoose);

			testSchema = new Schema({
				Point: mongoose.SchemaTypes.GeoJSONPoint,
				MultiPoint: mongoose.SchemaTypes.GeoJSONMultiPoint,
				LineString: mongoose.SchemaTypes.GeoJSONLineString,
				MultiLineString: mongoose.SchemaTypes.GeoJSONMultiLineString,
				Polygon: mongoose.SchemaTypes.GeoJSONPolygon,
				MultiPolygon: mongoose.SchemaTypes.GeoJSONMultiPolygon,
				GeoJSON: mongoose.SchemaTypes.GeoJSON,
				PointR: {type:mongoose.SchemaTypes.GeoJSONPoint,required:true},
				MultiPointR: {type:mongoose.SchemaTypes.GeoJSONMultiPoint,required:true},
				LineStringR: {type:mongoose.SchemaTypes.GeoJSONLineString,required:true},
				MultiLineStringR: {type:mongoose.SchemaTypes.GeoJSONMultiLineString,required:true},
				PolygonR: {type:mongoose.SchemaTypes.GeoJSONPolygon,required:true},
				MultiPolygonR: {type:mongoose.SchemaTypes.GeoJSONMultiPolygon,required:true},
				GeoJSONR: {type:mongoose.SchemaTypes.GeoJSON,required:true}
			});

			TestModel = mongoose.model('TestModel', testSchema);
		});

		beforeEach(function () {
			opts = {
				PointR: {
					type: 'Point',
					coordinates: [1, 2, 3]
				},
				MultiPointR: {
					type: 'MultiPoint',
					coordinates: []
				},
				LineStringR: {
					type: 'LineString',
					coordinates: [[1,2],[2,3]]
				},
				MultiLineStringR: {
					type: 'MultiLineString',
					coordinates: []
				},
				PolygonR: {
					type: 'Polygon',
					coordinates: []
				},
				MultiPolygonR: {
					type: 'MultiPolygon',
					coordinates: []
				},
				GeoJSONR: {
					type: 'MultiPoint',
					coordinates: []
				}
			};
		});

		function test (done, expectErr) {
			testObject = new TestModel(opts);
			testObject.save(function (err) {
				if (!!expectErr !== !!err) {
					done(err || new Error('Expected Error'));
				}
				else {
					done();
				}
			});
		}

		schemaNames.forEach(function (schemaName) {
			describe(schemaName, function () {
				var testVal;

				beforeEach(function () {
					testVal = {
						Point: {
							type: 'Point',
							coordinates: [1, 2, 3]
						},
						MultiPoint: {
							type: 'MultiPoint',
							coordinates: []
						},
						LineString: {
							type: 'LineString',
							coordinates: [[1,2],[2,3]]
						},
						MultiLineString: {
							type: 'MultiLineString',
							coordinates: []
						},
						Polygon: {
							type: 'Polygon',
							coordinates: []
						},
						MultiPolygon: {
							type: 'MultiPolygon',
							coordinates: []
						},
						GeoJSON: {
							type: 'MultiPoint',
							coordinates: []
						}
					};
					opts[schemaName] = testVal[schemaName];
				});

				it('sends error if type is not ' + schemaName, function (done) {
					testVal[schemaName].type = 'OtherVal';
					test(done, true);
				});
				it('sends error if coordinates are not valid', function (done) {
					testVal[schemaName].coordinates = 'invalid';
					test(done, true);
				});
				it('sends no error if valid', function (done) {
					test(done, false);
				});
				it('sends no error if not required and not set', function (done) {
					opts[schemaName] = null;
					test(done, false);
				});
				it('sends error if required and not set', function (done) {
					opts[schemaName+'R'] = null;
					test(done, true);
				});
			});
		});

		describe('GeoJSON', function () {
			var testVal;

			beforeEach(function () {
				testVal = {
					coordinates: []
				};
				opts.GeoJSON = testVal;
			});

			it('sends error if type is not in schemaNames', function (done) {
				testVal.type = 'OtherVal';
				test(done, true);
			});
			it('sends error if type is not defined', function (done) {
				testVal.type = null;
				test(done, true);
			});
			schemaNames.forEach(function (GeoJSONType) {
				it('calls the ' + GeoJSONType + ' validator when type is ' + GeoJSONType, function (done) {
					testVal.type = GeoJSONType;
					chai.assert.ok(typeValidators[GeoJSONType]);
					chai.assert.isFunction(typeValidators[GeoJSONType].validate);
					sinon.stub(typeValidators[GeoJSONType], 'validate').returns(true);
					test(function (err) {
						sinon.assert.called(typeValidators[GeoJSONType].validate);
						typeValidators[GeoJSONType].validate.restore();
						done(err);
					}, false);
				});
				it('returns an Error when the ' + GeoJSONType + ' validator returns false', function (done) {
					testVal.type = GeoJSONType;
					chai.assert.ok(typeValidators[GeoJSONType]);
					chai.assert.isFunction(typeValidators[GeoJSONType].validate);
					sinon.stub(typeValidators[GeoJSONType], 'validate').returns(false);
					test(function (err) {
						sinon.assert.called(typeValidators[GeoJSONType].validate);
						typeValidators[GeoJSONType].validate.restore();
						done(err);
					}, true);
				});
			});
		});
	});

	describe('types', function () {
		describe('index', function () {
			it('has properties in validators: LinearRing, LineString, MultiLineString, MultiPoint, MultiPolygon, Polygon, and Point', function () {
				chai.assert.sameMembers(Object.keys(typeValidators), types);
			});
			it('has a validate method for every property', function () {
				var i;

				for (i = 0; i < types.length; i++) {
					chai.assert.isFunction(typeValidators[types[i]].validate);
				}
			});
		});
		describe('linearRing', function () {
			var validate;

			before(function () {
				validate = typeValidators.LinearRing.validate;
			});

			beforeEach(function () {
				sinon.stub(typeValidators.LineString, 'validate');
			});
			afterEach(function () {
				typeValidators.LineString.validate.restore();
			});

			it('returns false if value is not an array', function () {
				chai.assert.isFalse(
					validate({})
				);
			});
			it('returns false if value is not a lineString', function () {
				typeValidators.LineString.validate.returns(false);
				chai.assert.isFalse(
					validate([
						[1],
						[2],
						[3],
						[4]
					])
				);
			});
			it('returns false if first and last members of value are not deep equal', function () {
				typeValidators.LineString.validate.returns(true);
				chai.assert.isFalse(
					validate([
						[1],
						[2],
						[3],
						[4]
					])
				);
			});
			it('returns false if value.length < 4', function () {
				typeValidators.LineString.validate.returns(true);
				chai.assert.isFalse(
					validate([
						[1],
						[2],
						[1]
					])
				);
			});
			it('returns true if valid', function () {
				typeValidators.LineString.validate.returns(true);
				chai.assert.isTrue(
					validate([
						[1],
						[2],
						[3],
						[1]
					])
				);
			});
		});
		describe('lineString', function () {
			var validate;

			before(function () {
				validate = typeValidators.LineString.validate;
			});

			beforeEach(function () {
				sinon.stub(typeValidators.MultiPoint, 'validate');
			});
			afterEach(function () {
				typeValidators.MultiPoint.validate.restore();
			});

			it('returns false if value is not an array', function () {
				chai.assert.isFalse(
					validate({})
				);
			});
			it('returns false if value is not a MultiPoint', function () {
				typeValidators.MultiPoint.validate.returns(false);
				chai.assert.isFalse(
					validate([
						[1],
						[2]
					])
				);
			});
			it('returns false if value.length < 2', function () {
				typeValidators.MultiPoint.validate.returns(true);
				chai.assert.isFalse(
					validate([
						[1]
					])
				);
			});
			it('returns true if valid', function () {
				typeValidators.MultiPoint.validate.returns(true);
				chai.assert.isTrue(
					validate([
						[1],
						[2]
					])
				);
			});
		});
		describe('multiLineString', function () {
			var validate;

			before(function () {
				validate = typeValidators.MultiLineString.validate;
			});

			beforeEach(function () {
				sinon.stub(typeValidators.LineString, 'validate');
			});
			afterEach(function () {
				typeValidators.LineString.validate.restore();
			});

			it('returns false if value is not an array', function () {
				chai.assert.isFalse(
					validate({})
				);
			});
			it('returns false if any member of value is not a lineString', function () {
				typeValidators.LineString.validate
					.onCall(0).returns(true)
					.onCall(0).returns(true)
					.onCall(0).returns(false)
					.onCall(0).returns(true);
				chai.assert.isFalse(
					validate([1, 2, 3, 4])
				);
			});
			it('returns true if valid', function () {
				typeValidators.LineString.validate.returns(true);
				chai.assert.isTrue(
					validate([1, 2, 3, 4])
				);
			});
		});
		describe('multiPoint', function () {
			var validate;

			before(function () {
				validate = typeValidators.MultiPoint.validate;
			});

			beforeEach(function () {
				sinon.stub(typeValidators.Point, 'validate');
			});
			afterEach(function () {
				typeValidators.Point.validate.restore();
			});

			it('returns false if value is not an array', function () {
				chai.assert.isFalse(
					validate({})
				);
			});
			it('returns false if any member of value is not a position', function () {
				typeValidators.Point.validate
					.onCall(0).returns(true)
					.onCall(0).returns(true)
					.onCall(0).returns(false)
					.onCall(0).returns(true);
				chai.assert.isFalse(
					validate([1, 2, 3, 4])
				);
			});
			it('returns true if valid', function () {
				typeValidators.Point.validate.returns(true);
				chai.assert.isTrue(
					validate([1, 2, 3, 4])
				);
			});
		});
		describe('multiPolygon', function () {
			var validate;

			before(function () {
				validate = typeValidators.MultiPolygon.validate;
			});

			beforeEach(function () {
				sinon.stub(typeValidators.Polygon, 'validate');
			});
			afterEach(function () {
				typeValidators.Polygon.validate.restore();
			});

			it('returns false if value is not an array', function () {
				chai.assert.isFalse(
					validate({})
				);
			});
			it('returns false if any member of value is not a polygon', function () {
				typeValidators.Polygon.validate
					.onCall(0).returns(true)
					.onCall(0).returns(true)
					.onCall(0).returns(false)
					.onCall(0).returns(true);
				chai.assert.isFalse(
					validate([1, 2, 3, 4])
				);
			});
			it('returns true if valid', function () {
				typeValidators.Polygon.validate.returns(true);
				chai.assert.isTrue(
					validate([1, 2, 3, 4])
				);
			});
		});
		describe('polygon', function () {
			var validate;

			before(function () {
				validate = typeValidators.Polygon.validate;
			});

			beforeEach(function () {
				sinon.stub(typeValidators.LinearRing, 'validate');
			});
			afterEach(function () {
				typeValidators.LinearRing.validate.restore();
			});

			it('returns false if value is not an array', function () {
				chai.assert.isFalse(
					validate({})
				);
			});
			it('returns false if any member of value is not a linearRing', function () {
				typeValidators.LinearRing.validate
					.onCall(0).returns(true)
					.onCall(0).returns(true)
					.onCall(0).returns(false)
					.onCall(0).returns(true);
				chai.assert.isFalse(
					validate([1, 2, 3, 4])
				);
			});
			it('returns true if valid', function () {
				typeValidators.LinearRing.validate.returns(true);
				chai.assert.isTrue(
					validate([1, 2, 3, 4])
				);
			});
		});
		describe('position', function () {
			var validate;

			before(function () {
				validate = typeValidators.Point.validate;
			});

			it('returns false if value is not an array', function () {
				chai.assert.isFalse(
					validate({})
				);
			});
			it('returns false if value.length is not 2 or 3', function () {
				chai.assert.isFalse(
					validate([1])
				);
				chai.assert.isFalse(
					validate([])
				);
				chai.assert.isFalse(
					validate([1, 2, 3, 4])
				);
			});
			it('returns false if value\'s members are not numbers', function () {
				chai.assert.isFalse(
					validate([1, 2, '3'])
				);
			});
			it('returns true if valid', function () {
				chai.assert.isTrue(
					validate([1, 2, 3])
				);
				chai.assert.isTrue(
					validate([1, 2])
				);
			});
		});
	});
});