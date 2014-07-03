var validators = require('./typeValidators').validators;

exports.register = function (mongoose) {
	var SchemaType = mongoose.SchemaType;
	var CastError = SchemaType.CastError;
	var names = Object.keys(validators);

	names.forEach(function (name) {
		exports.registerType(mongoose, name);
	});

	function GeoJSON(key, options){
		SchemaType.call(this,key,options, 'GeoJSON');
	}

	GeoJSON.prototype = new mongoose.SchemaTypes.Mixed;

	GeoJSON.prototype.cast = function (value, doc, init) {
		var validator = value && value.type && value.coordinates && validators[value.type];

		if (validator && validator.validate(value.coordinates)) {
			return value;
		}
		else {
			throw new CastError(GeoJSON.name, value, this.path);
		}
	};

	mongoose.SchemaTypes[GeoJSON.name] = GeoJSON;

};

exports.registerType = function (mongoose, name) {
	var SchemaType = mongoose.SchemaType;
	var CastError = SchemaType.CastError;
	var typeName = 'GeoJSON' + name;

	var GeoJsonType = (new Function(
		'SchemaType', 'name',
			"return function " + typeName + " (key, options) {SchemaType.call(this, key, options, 'GeoJSON'+name);}"
	))(SchemaType, name);

	GeoJsonType.prototype = new mongoose.SchemaTypes.Mixed;

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