var multiPointType = require('./multiPoint');

exports.validate = function (value) {
	if (multiPointType.validate(value) && value.length > 1) {
		return true;
	}
	else {
		return false;
	}
};