exports.validate = function (value) {
	var validator = exports.validators[this.type];

	return validator && validator.validate(value);
};

exports.validators = {
	MultiPolygon: require('./multiPolygon'),
	Polygon: require('./polygon'),
	Point: require('./position'),
	MultiPoint: require('./multiPoint'),
	LineString: require('./lineString'),
	LinearRing: require('./linearRing'),
	MultiLineString: require('./multiLineString')
};