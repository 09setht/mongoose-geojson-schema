var lineString = require('./lineString');

exports.validate = function (value) {
	var i;

	if (typeof value.length === 'number') {
		for (i = 0; i < value.length; i++) {
			if (!lineString.validate(value[i])) {
				return false;
			}
		}

		return true;
	}
	else {
		return false;
	}
};