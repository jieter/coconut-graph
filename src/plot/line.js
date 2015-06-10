var d3 = require('d3');

var unnamed_series = 1;

module.exports = function (x, y, plot, graph) {

	var line = d3.svg.line()
		.x(function(d) { return x(d[0]); })
		.y(function(d) { return y(d[plot.data_key]); });

	var line_plot = function (sel) {
		sel.attr('d', line);
	};

	var selection = graph.plotContainer
		.selectAll('.series-' + plot.key)
		.data([graph.data.values]);

	selection.enter().append('path')
		.attr({
			class: 'plot plot-line series-' + plot.key,
			'data-legend': plot.label || 'series ' + unnamed_series++
		})
		.call(line_plot);

	selection.exit().remove();

	return line_plot;
};
