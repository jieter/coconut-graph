var extend = require('extend');
var d3 = require('d3');
require('./d3.nl_nl.js')(d3);

var formatters = {
	day: function (xticks, xlabels, width) {
		var interval = width > 800 ? 1 :
					   width > 550 ? 2 :
					   width > 400 ? 3 : 4;

		xticks.ticks(d3.time.hours, interval);
		xlabels.ticks(d3.time.hours, interval)
			.tickFormat(d3.locale.nl_NL.timeFormat('%H:%M'));
	},
	week: function (xticks, xlabels, width) {
		xticks.ticks(d3.time.day);

		var tickFormat = (width > 700 ? '%A' : '%a') + ' %-d ';
		tickFormat += (width > 550 ? '%B' :
					   width > 400 ? '%b' : '');

		xlabels
			.ticks(d3.time.hour, 12)
			.tickFormat(function (d) {
				if (d.getHours() === 12) {
					return d3.locale.nl_NL.timeFormat(tickFormat)(d);
				}
			});
	},
	month: function (xticks, xlabels, width) {
		var wide = width > 550;

		xticks.ticks(d3.time.day, wide ? 1 : 4);
		xlabels.ticks(d3.time.hour, wide ? 12 : 24)
			.tickFormat(function (d) {
				if (wide) {
					if (d.getHours() === 12) {
						return d3.locale.nl_NL.timeFormat('%-d')(d);
					}
				} else if (d.getHours() === 0 && d.getDate() % 4 === 1) {
					return d3.locale.nl_NL.timeFormat('%-d')(d);
				}
			});
	},
	year: function (xticks, xlabels, width) {
		xticks.ticks(d3.time.month);

		var tickFormat = (width > 550 ? '%B' : '%b');
		xlabels
			.ticks(d3.time.day, 15)
			.tickFormat(function (d) {
				if (d.getDate() === 16) {
					return d3.locale.nl_NL.timeFormat(tickFormat)(d);
				}
			});
	}
};

module.exports = function (graph, options) {
	options = extend({}, options);
	var name = options.name;

	var scale = d3.time.scale().range([0, graph.width()]);

	var xticks = d3.svg.axis().scale(scale).orient('bottom').tickFormat('');
	var xlabels = d3.svg.axis().scale(scale).orient('bottom').tickSize(0).tickPadding(7);

	var Axis = function () {};
	Axis.name = name;
	Axis.scale = scale;

	Axis.render = function () {

		var height = graph.height();
		[
			{axis: xticks},
			{axis: xlabels, class: 'labels'}
		].forEach(function(axis) {
			graph.svg.append('g').attr({
				class: 'x axis ' + (axis.class || ''),
				transform: 'translate(0, ' + height + ')'
			});
		});
	};

	Axis.update = function (extent) {
		var svg = graph.svg;
		scale.range([0, graph.width()]);
		scale.domain(extent || graph.extents());

		formatters[graph.meta.period](xticks, xlabels, graph.width());

		svg.selectAll('.x.axis').call(xticks);
		svg.selectAll('.x.axis.labels').call(xlabels);
	};

	return Axis;
};
