var validators = require('./typeValidators').validators;

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

	GeoJSONCoordinates.prototype = new mongoose.SchemaTypes.Mixed;

	GeoJSONCoordinates.prototype.checkRequired = function (value, doc) {
		return !!value;
//		var typePath = this.path.replace(/coordinates$/, 'type');
//		var name = doc.get(typePath);
//
//		return validators[name].validate(value);
	};

	GeoJSONCoordinates.prototype.cast = function (value, doc, init) {
		var validator = value && value.type && value.coordinates && validators[value.type];

		if (validator && validator.validate(value.coordinates)) {
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

	GeoJsonType.prototype = new mongoose.SchemaTypes.Mixed;

	GeoJsonType.prototype.checkRequired = function (value, doc) {
		return !!value;
		return validators[name].validate(value);
	};

	GeoJsonType.prototype.cast = function (value, doc, init) {
		if (value && value.type === name && value.coordinates && validators[name].validate(value.coordinates)) {
			return value;
		}
		else {
			throw new CastError(typeName, value, this.path);
		}
	};

	mongoose.SchemaTypes[typeName] = GeoJsonType;
};