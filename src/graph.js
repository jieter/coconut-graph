var Class = require('./class.js');
var extend = require('extend');
var Util = require('./util.js');

var d3 = require('d3');
var d3legend = require('d3-legend')(d3);

var xaxis = require('./axis/x-time.js');
var yaxis = require('./axis/y.js');

var spinner = require('./spinner.js');

var Graph = Class.extend({
	options: {
		margin_top: 20,
		margin_bottom: 30,
		margin_left: 32,
		margin_right: 5,

		height: 260,
		spinner: true,

		axes: {
			x: {},
			y: {orient: 'left', guides: true}
		}
	},

	initialize: function (options) {
		this.container = document.getElementById(options.container);
		// enable reuse of container;
		d3.select(this.container).selectAll('svg').remove();

		options.axes = extend({}, this.options.axes, options.axes || {});

		if (options.plot) {
			options.plots = [options.plot];
		}
		options.plots.forEach(function(plot) {
			if (!plot.type) {
				plot.type = 'line';
			}
			if (!plot.key) {
				throw 'key must be supplied.';
			}
			if (!plot.axis) {
				plot.axis = 'y';
			}

			if (!options.ylabel && plot.axis === 'y' && plot.label) {
				options.ylabel = plot.label;
			}
		});
		Util.setOptions(this, options);

		this._initContainer();
		this._initAxes();
		this.spinner = spinner(this.container, {
			height: this.options.height,
			width: this.width()
		});
		this.spinner();

		// Attach onresize listener
		// namespace resize events to be able to attach multiple listeners
		var self = this;
		if (!Graph.onResizeCounter) { Graph.onResizeCounter = 0; }
		this._resizeEvent = 'resize.' + (Graph.onResizeCounter++);
		d3.select(window).on(this._resizeEvent, function () {
			self.onResize();
		});
	},

	remove: function () {
		d3.select(window).on(this._resizeEvent, null);
		d3.select(this.container).selectAll('svg').remove();
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
		for (var name in this.axes) {
			callback.call(this, name, this.axes[name]);
		}
	},
	eachPlot: function (callback) {
		for (var i in this.options.plots) {
			callback.call(this, this.options.plots[i], i);
		}
	},

	_initAxes: function () {
		var axes = this.axes = {};

		for (var name in this.options.axes) {
			var options = extend({name: name}, this.options.axes[name]);

			axes[name] = (name === 'x' ? xaxis : yaxis)(this, options);
			axes[name].render();
		}
	},

	_initContainer: function () {
		var container = d3.select(this.container);

		container.classed('chart ' + (this.options.className || ''), true);

		var svg = container.append('svg')
			.attr({width: this.outerWidth(), height: this.outerHeight()})
				.append('g')
				.attr('transform', 'translate(' + this.margin('left') + ',' + this.margin('top') + ')');

		this.plotContainer = svg.append('g'); //.attr('plots');
		this.svg = svg;
	},

	_updateAxes: function () {
		this.eachAxis(function (name, axis) {
			axis.update();
		});
	},

	firstRender: true,
	render: function (callback) {
		if (this.firstRender) {
			this.eachPlot(function (plot) {
				if (typeof plot.key === 'function') {
					plot.data_function = plot.key;
					plot.key = 'composed';
				} else {
					plot.data_key = this.data_key(plot.key);
					plot.data_function = function(d) { return d[plot.data_key]; };
				}
			});
		}
		this.eachPlot(function(plot) {
			var extent = d3.extent(this.data.values, plot.data_function);

			// hide or unhide plots
			if (plot.hideIfEmpty && (this.data.values.length === 0 || (extent[0] < 0 && extent[1] < 0))) {
				d3.select(this.container).style('display', 'none');
				return;
			} else {
				d3.select(this.container).style('display', 'block');
			}

			// Include zero in the scale if not already.
			if (this.options.axes[plot.axis].includeZero) {
				extent.push(0);
				extent = d3.extent(extent);
			}
			this.axes[plot.axis].domain(extent);
		});

		this._updateAxes();

		var xscale = this.axes.x.scale;
		this.eachPlot(function (plot) {
			var plot_function = this['plot_' + plot.type];
			plot.fn = plot_function(xscale, this.axes[plot.axis].scale, plot, this);
		});

		if (this.firstRender && this.options.show_legend) {
			this._addLegend();
		}

		if (callback) {
			callback(this, this.data, this.meta);
		}
		this.spinner.remove();
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
			this.svg.selectAll('.plot.series-' + plot.key).call(plot.fn);
		});
	},

	plot_line: require('./plot/line.js'),
	plot_scatter: require('./plot/scatter.js'),
	plot_bar: require('./plot/bar.js')
});

module.exports = Graph;
