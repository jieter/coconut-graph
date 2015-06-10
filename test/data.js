var data = [{
	'meta': {
		'period': 'day',
		'urls': {
			'next': '<url to get json for the next day>',
			'previous': '<url to get json for previous day>'
		},
		'readable_interval': '15 minuten'
	},
	'data': {
		'keys': ['timestamp', 'amount', 'test', 'foo'],
		'extents': ['2015-05-29T00:00:00', '2015-05-29T23:59:59'],
		'values': [
			['2015-05-29T00:00:00', 0, 1, 7],
			['2015-05-29T14:00:00', 10, 2, 5],
			['2015-05-29T14:15:00', 0, 3, 7],
			['2015-05-29T14:30:00', 5, 4, 7],
			['2015-05-29T14:45:00', 4, 5, 7],
			['2015-05-29T15:00:00', 6, 5, 7]
		],
		'slices': 96
	}
}, {
	'meta': {
		'period': 'day',
		'urls': {
			'next': '<url to get json for the next day>',
			'previous': '<url to get json for previous day>'
		},
		'readable_interval': '15 minuten'
	},
	'data': {
		'keys': ['timestamp', 'amount', 'test', 'foo'],
		'extents': ['2015-05-29T00:00:00', '2015-05-29T23:59:59'],
		'values': [
			['2015-05-29T00:00:00', 5, 7, 5],
			['2015-05-29T14:00:00', 10, 6, 7],
			['2015-05-29T14:15:00', 9, 5, 5],
			['2015-05-29T14:30:00', 0, 4, 5],
			['2015-05-29T14:45:00', 0, 3, 5],
			['2015-05-29T15:00:00', 0, 2, 5]
		],
		'slices': 96
	}
}];

if (typeof module === 'object' && define.exports) {
	module.exports = data;
}
