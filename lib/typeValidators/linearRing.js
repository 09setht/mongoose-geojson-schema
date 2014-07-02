var linearStringType = require('./lineString');

exports.validate = function(value){
	var first;
	var last;
	var i;

	if (value.length < 4 || !linearStringType.validate(value)){
		return false;
	}

	first = value[0];
	last = value[value.length - 1];

	if (first.length !== last.length){
		return false;
	}

	for (i=0; i < first.length; i++){
		if (first[i] !== last[i]){
			return false;
		}
	}

	return true;
};