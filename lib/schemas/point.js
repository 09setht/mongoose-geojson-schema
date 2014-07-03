module.exports.register = function (mongoose) {
	var names = Object.keys(require('../typeValidators').validators);
	require('../schemaTypes/point').register(mongoose);

	names.forEach(function (name) {
		module.exports.registerSchema(mongoose, name);
	});

	module.exports.GeoJSON = {
		type: {type: String, enum:names, default: 'Point'},
		coordinates: mongoose.SchemaTypes.GeoJSONCoordinates
	};
};

module.exports.registerSchema = function (mongoose, name) {
	if (!mongoose.SchemaTypes['GeoJSON' + name + 'Coordinates']) {
		var s = 1;
	}
	module.exports['GeoJSON' + name] = {
		type: {type: String, enum: [name], default: name},
		coordinates: mongoose.SchemaTypes['GeoJSON' + name + 'Coordinates']
	};
};