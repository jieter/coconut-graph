var d3 = require('d3');
var extend = require('extend');

var defaultOptions = {
	width: 100,
	height: 100,
	color: '#4D4D4D'
};

// inspired by http://bl.ocks.org/MattWoelk/6132258
module.exports = function spinner(container, options) {
	options = extend({}, defaultOptions, options);

	var radius = Math.min(options.width, options.height) / 4;
	var arc = d3.svg.arc()
		.innerRadius(radius * 0.5)
		.outerRadius(radius * 0.52)
		.startAngle(0);

	var g = d3.select(container).select('svg').append('g')
		.attr({
			class: 'spinner',
			width: options.width,
			height: options.height,
			transform: 'translate(' + options.width / 2 + ',' + options.height / 2 + ')'
		});

	var timeout;
	var Spin = function () {
		function spin(selection, duration) {
			selection.transition()
				.ease('linear')
				.duration(duration)
				.attrTween('transform', function () {
					return d3.interpolateString('rotate(0)', 'rotate(360)');
				});

			timeout = setTimeout(function() { spin(selection, duration); }, duration);
		}
		g.append('path')
			.datum({endAngle: 0.33 * 2 * Math.PI})
			.style('fill', options.color)
			.attr('class', 'foo')
			.attr('d', arc)
			.call(spin, 800);

		return this;
	};

	Spin.remove = function () {
		g.remove();
		clearTimeout(timeout);
	};

	return Spin;
};
