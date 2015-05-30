var Class = require('./class.js');
var Util = require('./util.js');

var d3 = require('d3');
var d3tip = require('d3-tip')(d3);
var d3legend = require('d3-legend')(d3);

var timeAxis = require('./time-xaxis.js');

var Graph = Class.extend({
	options: {
		margin_top: 20,
		margin_bottom: 30,
		margin_left: 32,
		margin_right: 5,

		height: 260,

		axes: {
			y: {orient: 'left'}
		}
	},
	statics: {
		parseDatetime: d3.time.format('%Y-%m-%dT%H:%M:%S').parse
	},

	initialize: function (options) {
		this.container = document.getElementById(options.container);

		options.axes = Util.extend({}, this.options.axes, options.axes || {});

		if (options.plot) {
			options.plots = [options.plot];
		}
		options.plots.forEach(function(plot) {
			if (!plot.type) {
				plot.type = 'line';
			}
			if (!('key' in plot)) {
				throw 'key must be suplied.';
			}
			if (!('axis' in plot)) {
				plot.axis = 'y';
			}

			if (!options.ylabel && plot.axis === 'y' && plot.label) {
				options.ylabel = plot.label;
			}
		});
		Util.setOptions(this, options);

		this._initAxes();
		this._initContainer();

		var self = this;
		// namespace resize events to be able to attach multiple listeners
		if (!Graph.onResizeCounter) { Graph.onResizeCounter = 0; }
		d3.select(window).on('resize.' + (Graph.onResizeCounter++), function () {
			self.onResize();
		});

		if (options.url && options.url !== undefined) {
			this.original_url = options.url;
			this.load(options.url, options.callback);
		}
	},

	data_key: function (name) {
		return this.data.keys.indexOf(name);
	},

	extents: function () { return this.data.extents; },
	width: function () { return this.outerWidth() - this.margin('left') - this.margin('right'); },
	height: function () { return this.outerHeight() - this.margin('top') - this.margin('bottom'); },

	outerWidth: function () { return this.container.offsetWidth; },
	outerHeight: function () { return this.options.height; },
	margin: function (m) { return this.options['margin_' + m]; },

	ylabel: function () {
		if (this.options.ylabel) {
			return this.options.ylabel;
		}
	},

	eachAxis: function (callback) {
		for (var name in this.options.axes) {
			callback.call(this, name, this.options.axes[name]);
		}
	},
	eachPlot: function (callback) {
		for (var i in this.options.plots) {
			callback.call(this, this.options.plots[i], i);
		}
	},

	_initAxes: function () {
		var scale = this.scale = {
			x: d3.time.scale().range([0, this.width()])
		};

		var axes = this.axes = {
			xticks: d3.svg.axis().scale(this.scale.x).orient('bottom').tickFormat(''),
			xlabels: d3.svg.axis().scale(this.scale.x).orient('bottom').tickSize(0).tickPadding(7)
		};

		this.eachAxis(function (name, axis) {
			scale[name] = d3.scale.linear().rangeRound([this.height(), 0]);
			axes[name] = d3.svg.axis().scale(scale[name]).orient(axis.orient || 'left');

			if ('tickFormat' in axis) {
				if (typeof axis.tickFormat === 'string') {
					axes[name].tickFormat(d3.format(axis.tickFormat));
				} else {
					axes[name].tickFormat(axis.tickFormat);
				}
			}
		});
	},

	_initContainer: function () {
		var container = d3.select(this.container);
		container.classed('chart ' + (this.options.className || ''));

		var svg = container.append('svg')
			.attr({width: this.outerWidth(), height: this.outerHeight()})
				.append('g')
				.attr('transform', 'translate(' + this.margin('left') + ',' + this.margin('top') + ')');

		this.plotContainer = svg.append('g');

		// initialize the (double) x-axis
		var height = this.height();
		[
			{axis: this.axes.xticks},
			{axis: this.axes.xlabels, class: 'labels'}
		].forEach(function(axis) {
			svg.append('g').attr({
				class: 'x axis ' + (axis.class || ''),
				transform: 'translate(0, ' + height + ')'
			});
		});

		// initialize the y axes
		this.eachAxis(function (name, axis) {
			var el = svg.append('g').attr('class', 'axis ' + name);

			var text = el.append('text')
				.attr({
					class: 'axislabel',
					transform: 'rotate(-90)'
				}).text(axis.label || this.options.ylabel);

			if (axis.orient && axis.orient === 'right') {
				text.attr('dy', '-.5em');
				el.attr('translate( ' + (this.width()) + ', 0)');
			} else {
				text.attr({y: 6, dy: '.71em'});
			}
		});
		this.svg = svg;
	},

	_updateAxes: function () {
		var svg = this.svg;
		var width = this.width();

		this.scale.x.domain(this.extents());

		// call the right x-axis formatter for this period.
		timeAxis[this.meta.period](this.axes, this.width());
		svg.selectAll('.x.axis').call(this.axes.xticks);
		svg.selectAll('.x.axis.labels').call(this.axes.xlabels);

		// x axes
		this.scale.x.range([0, width]);
		timeAxis[this.meta.period](this.axes, this.width());

		svg.select('.x.axis').call(this.axes.xticks);
		svg.select('.x.axis.labels').call(this.axes.xlabels);

		var axes = this.axes;
		this.eachAxis(function (name, axis) {
			if (axis.ticks) {
				axes[name].ticks(axis.ticks);
			}
			// right oriented y axes
			var ax = svg.selectAll('.axis.' + name).call(axes[name]);
			if (axis.orient && axis.orient === 'right') {
				ax.attr('transform', 'translate(' + width + ', 0)');
			}
		});
	},

	firstRender: true,
	render: function (callback) {
		this._updateAxes();

		var xscale = this.scale.x;
		this.plots = {};

		// var yaxis_extents = {};

		this.eachPlot(function(plot) {
			plot.data_key = this.data_key(plot.key);

			var extent = d3.extent(this.data.values, function(d) { return d[plot.data_key]; });

			// hide or unhide plots
			if (plot.hideIfEmpty && (this.data.values.length === 0 || (extent[0] < 0 && extent[1] < 0))) {
				d3.select(this.container).style('display', 'none');
				return;
			} else {
				d3.select(this.container).style('display', 'block');
				this._updateAxes();
			}

			// Include zero in the scale if not already.
			if (this.options.axes[plot.axis].includeZero) {
				extent.push(0);
				extent = d3.extent(extent);
			}
			// update the extent for this scale.
			this.scale[plot.axis].domain(extent).nice();

			this.svg.selectAll('.axis.' + plot.axis).call(this.axes[plot.axis]);

			// Do the actual plotting
			this.plots[plot.key] = this['plot_' + plot.type](xscale, this.scale[plot.axis], plot);
		});

		if (this.firstRender && this.options.show_legend) {
			this._addLegend();
		}

		if (callback) {
			callback(this, this.data, this.meta);
		}
		this.firstRender = false;
	},

	_addLegend: function () {
		var y = this.height() - 20 - this.options.plots.length * 8;
		this.svg.append('g')
			.attr({
				class: 'legend',
				transform: 'translate( ' + (this.margin('left') - 10) + ', ' + y + ')'
			}).call(d3legend);
	},

	onResize: function () {
		// only resize if width actually changed.
		var width = this.width();
		if (this.current_width === width) { return; }
		this.current_width = width;

		// update graph width
		d3.select(this.container).select('svg').attr('width', this.outerWidth());

		this._updateAxes();

		this.eachPlot(function (plot) {
			if (plot.type === 'bar') {
				var x = this.scale.x;

				this.svg.selectAll('.water')
					.attr('x', function(d) { return x(d[0]); })
					.attr('width', this.width() / this.data.slices);
			} else {
				this.svg.selectAll('.plot.' + plot.key).call(this.plots[plot.key]);
			}
		});
	},

	unnamed_series: 1,
	plot_line: function (x, y, plot) {
		var line = function (s) {
			s.attr('d', d3.svg.line()
				.x(function(d) { return x(d[0]); })
				.y(function(d) { return y(d[plot.data_key]); })
			);
		};

		this.plotContainer.selectAll('.line.' + plot.key)
			.data([this.data.values])
			.enter()
			.append('path')
				.attr('class', 'plot line ' + plot.key)
				.attr('data-legend', plot.label || 'series ' + this.unnamed_series++);

		this.svg.selectAll('.line.' + plot.key)
			.transition().duration(200)
			.call(line);

		return line;
	},

	plot_scatter: function(x, y, plot) {
		var scatter = this.plots[plot.key] = function (s) {
			s.attr({
				cx: function(d) { return x(d[0]); },
				cy: function(d) { return y(d[plot.data_key]); }
			});
		};
		var sel = this.plotContainer.selectAll('circle.' + plot.key).data(this.data.values);
		sel.exit().remove();
		sel.enter()
			.append('circle')
			.attr({
				class: 'plot ' + plot.key,
				r: 2
			}).call(scatter);
		return scatter;
	},

	plot_bar: function (x, y, plot) {
		var key = plot.data_key;
		var max = d3.max(this.data.values, function(d) { return d[key]; }) * 1.1;
		y.domain([0, max]).nice();

		if (max > 1000) {
			this.axes.y.tickFormat(function (d) { return Math.round(d / 100) / 10; });
			this.svg.selectAll('.y.axis > text').text('verbruik [m³]');
		} else {
			this.axes.y.tickFormat(function (d) { return d; });
			this.svg.selectAll('.y.axis > text').text('verbruik [l]');
		}
		this.svg.selectAll('.axis.y').call(this.axes.y);

		var readable_interval = this.meta.readable_interval;
		var tip = d3tip().attr('class', 'bar-tooltip')
			.offset([-10, 0])
			.html(function(d) {
				var amount = d[key];
				if (amount > 1000) {
					amount = Math.round(amount / 1000) + 'm³';
				} else {
					amount = amount + 'l';
				}
				return amount + ' / ' + readable_interval;
			});
		this.svg.call(tip);

		var height = this.height();
		var sliceWidth = this.width() / this.data.slices;

		var bar = this.plots[plot.key] = function (s) {
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

		var sel = this.plotContainer.selectAll('.water').data(this.data.values);

		sel.exit().remove();
		sel.enter().append('rect')
			.attr('class', 'water')
			.on({mouseover: tip.show, mouseout: tip.hide});

		sel.call(bar);
		return bar;
	}
});

module.exports = Graph;
