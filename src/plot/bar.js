var d3 = require('d3');
var d3tip = require('d3-tip')(d3);

var tip = function (amount_key, readable_interval) {
	return d3tip().attr('class', 'bar-tooltip')
		.offset([-10, 0])
		.html(function(d) {
			var amount = d[amount_key];
			if (amount > 1000) {
				amount = Math.round(amount / 1000) + 'm³';
			} else {
				amount = amount + 'l';
			}
			return amount + ' / ' + readable_interval;
		});
};

module.exports = function (x, y, plot, graph) {
	var key = plot.data_key;
	var max = d3.max(graph.data.values, function(d) { return d[key]; }) * 1.1;

	y.domain([0, max]).nice();

	// TODO: make sure it uses the right axis.
	if (max > 1000) {
		graph.axes.y.tickFormat(function (d) { return Math.round(d / 100) / 10; });
		graph.svg.selectAll('.y.axis > text').text('verbruik [m³]');
	} else {
		graph.axes.y.tickFormat(function (d) { return d; });
		graph.svg.selectAll('.y.axis > text').text('verbruik [l]');
	}
	graph.svg.selectAll('.axis.y').call(graph.axes.y);

	graph.svg.call(tip(key, graph.meta.readable_interval));

	var height = graph.height();

	var bar = function (s) {
		var sliceWidth = graph.width() / graph.data.slices;
		s.attr({
			x: function(d) { return x(d[0]); },
			y: function() { return y(0); },
			width: sliceWidth,
			height: 0
		}).transition().duration(100)
		.attr({
			height: function(d) { return height - y(d[key]); },
			y: function(d) { return y(d[key]); }
		});
	};

	var sel = graph.plotContainer.selectAll('.bar.' + plot.key).data(graph.data.values);

	sel.exit().remove();
	sel.enter().append('rect')
		.attr('class', 'bar ' + plot.key)
		.on({mouseover: tip.show, mouseout: tip.hide});

	sel.call(bar);

	return bar;
};
