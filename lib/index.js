var types = require('./typeValidators/index');
var registered = false;

module.exports.register = function (mongoose) {
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

		exports.GeoJSON = function (opts) {
			opts = opts || {};

			return {
				type: {type: String, required: opts.required || false, enum: schemaNames},
				coordinates: {type: Schema.Types.Mixed, validate: types.getValidator(opts)}
			};
		};
	}
};

function registerSchema (type, Schema) {
	var schema = function (opts) {
		opts = opts || {};

		return {
			type: {type: String, required: opts.required || false, default: type, validate: validateType},
			coordinates: {type: Schema.Types.Mixed, validate: types.getValidator(opts)}
		};
	};
	exports[type] = schema;

	function validateType (value) {
		return value === type;
	}

	return type;
}