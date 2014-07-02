var polygon = require('./polygon');

exports.validate = function(value){
	var i;

	if (typeof value.length === 'number'){
		for (i=0; i < value.length; i++){
			if (!polygon.validate(value[i])){
				return false;
			}
		}

		return true;
	}

	return false;
};