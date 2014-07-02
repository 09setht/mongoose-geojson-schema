exports.validate = function (value) {
	var i;

	if (value.length === 2 || value.length === 3) {
		for (i = 0; i < value.length; i++){
			if (typeof value[i] !== 'number'){
				return false;
			}
		}

		return true;
	}

	return false;
};