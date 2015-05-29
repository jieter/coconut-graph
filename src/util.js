var util = {
	extend: function (dest) {
		var sources = Array.prototype.slice.call(arguments, 1),
		    i, j, len, src;

		for (j = 0, len = sources.length; j < len; j++) {
			src = sources[j] || {};
			for (i in src) {
				if (src.hasOwnProperty(i)) {
					dest[i] = src[i];
				}
			}
		}
		return dest;
	},
	// create an object from a given prototype
	create: Object.create || function () {
		function F() {}
		return function (proto) {
			F.prototype = proto;
			return new F();
		};
	},
	template: function (str, data) {
		return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
			var value = data[key];
			if (value === undefined) {
				throw new Error('No value provided for variable ' + str);
			} else if (typeof value === 'function') {
				value = value(data);
			}
			return value;
		});
	},
	setOptions: function (obj, options) {
		obj.options = util.extend({}, obj.options, options);
		return obj.options;
	}
};

module.exports = util;
