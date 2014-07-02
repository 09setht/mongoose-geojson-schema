var types = require('./typeValidators/index');
var registered = false;

module.exports.register = function(mongoose){
	var i;
	var Schema = mongoose.Schema;
	var exports = module.exports;

	var schemaNames = [
		'Point',
		'MultiPoint',
		'LineString',
		'MultiLineString',
		'Polygon',
		'MultiPolygon'
	];

	if (!registered) {
		registered = true;

		for (i = 0; i < schemaNames.length; i++) {
			registerSchema(schemaNames[i], Schema);
		}

		exports.GeoJSON = new Schema({
			type: {type: String, required: true, enum: schemaNames},
			coordinates: []
		});
		exports.GeoJSON.path('coordinates').validate(types.validate);
	}
};

function registerSchema (type, Schema) {
	var schema = new Schema({
		type: {type: String, required: true, default: type},
		coordinates: []
	});
	exports[type] = schema;

	schema.path('coordinates').validate(types.validators[type].validate);
	schema.path('type').validate(function (value) {
		return value === type;
	});
	return type;
}