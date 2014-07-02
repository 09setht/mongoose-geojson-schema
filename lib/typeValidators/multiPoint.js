var positionType = require('./position');

exports.validate = function (value) {
	var i;

	if (typeof value.length === 'number') {
		for (i = 0; i < value.length; i++) {
			if (!positionType.validate(value[i])) {
				return false;
			}
		}

		return true;
	}
	else {
		return false;
	}
};