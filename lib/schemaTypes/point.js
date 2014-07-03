var validators = require('../typeValidators').validators;

exports.register = function (mongoose) {
	var SchemaType = mongoose.SchemaType;
	var CastError = SchemaType.CastError;
	var names = Object.keys(validators);

	names.forEach(function (name) {
		exports.registerType(mongoose, name);
	});

	function GeoJSONCoordinates(key, options){
		SchemaType.call(this,key,options, 'GeoJSON');
	}

	GeoJSONCoordinates.prototype.__proto__ = SchemaType.prototype;

	GeoJSONCoordinates.prototype.checkRequired = function (value, doc) {
		var typePath = this.path.replace(/coordinates$/, 'type');
		var name = doc.get(typePath);

		return validators[name].validate(value);
	};

	GeoJSONCoordinates.prototype.cast = function (value, doc, init) {
		var typePath = this.path.replace(/coordinates$/, 'type');
		var name = doc.get(typePath);

		if (validators[name].validate(value)) {
			return value;
		}
		else {
			throw new CastError(GeoJSONCoordinates.name, value, this.path);
		}
	};

	mongoose.SchemaTypes[GeoJSONCoordinates.name] = GeoJSONCoordinates;

};

exports.registerType = function (mongoose, name) {
	var SchemaType = mongoose.SchemaType;
	var CastError = SchemaType.CastError;
	var typeName = 'GeoJSON' + name + 'Coordinates';

	var GeoJsonType = (new Function(
		'SchemaType', 'name',
			"return function " + typeName + " (key, options) {SchemaType.call(this, key, options, 'GeoJSON'+name);}"
	))(SchemaType, name);

	GeoJsonType.prototype.__proto__ = SchemaType.prototype;

	GeoJsonType.prototype.checkRequired = function (value, doc) {
		return validators[name].validate(value);
	};

	GeoJsonType.prototype.cast = function (value, doc, init) {
		if (validators[name].validate(value)) {
			return value;
		}
		else {
			throw new CastError(typeName, value, this.path);
		}
	};

	mongoose.SchemaTypes[typeName] = GeoJsonType;
};