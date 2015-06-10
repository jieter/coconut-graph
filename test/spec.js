/* globals
  describe:true
  it:true
  chai:true
  d3: true
  Graph:true
 */

var data = {
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
};

(function disableD3animations() {
	// add a duration function to the selection prototype
	d3.selection.prototype.duration = function() { return this; };
	// hack the transition function of d3's select API
	d3.selection.prototype.transition = function() { return this; };
})();

var container = 'container';
var c = document.getElementById(container);

describe('coconut-graph', function () {
	chai.should();

	describe('Graph loader', function () {
		var spy = chai.spy();

		var loader = new Graph.Loader(Graph.util.extend({}, data), {
			graphs: [
				{
					container: container,
					className: 'extra',
					axes: {y: {includeZero: true}},
					plot: {key: 'amount', axis: 'y', label: 'verbruik [l]', type: 'bar'}
				}
			],
			callback: spy
		});

		it('adds classnames to graph container', function () {
			c.className.should.contain('chart');
			c.className.should.contain('extra');
		});

		it('preserves existing classnames on containers', function () {
			c.className.should.contain('container');
		});

		it('should call the callback', function () {
			spy.should.have.been.called();
		});

		it('has attributes set', function () {
			loader.should.contain.keys('meta', 'options');
		});

		it('Can be removed', function () {
			loader.graphs[container].remove();
		});

		it('should create multiple plots in one chart', function () {
			loader = new Graph.Loader(Graph.util.extend({}, data), {
				graphs: [
					{
						container: container,
						margin_right: 40,
						axes: {
							y: {includeZero: true},
							y1: {includeZero: true, orient: 'right'}
						},
						plots: [
							{key: 'amount', axis: 'y', label: 'verbruik [l]', type: 'bar'},
							{key: 'test', axis: 'y1', label: 'test', type: 'line'},
							{key: 'foo', axis: 'y1', label: 'foo', type: 'scatter'}
						]
					}
				]
			});
			loader.graphs.should.contains.key(container);

			// var graph = loader.graphs[container];
			// graph.plots.should.have.keys('amount', 'test', 'foo');
		});
	});

	describe('bar graph', function () {
		it('it should draw 6 bars', function () {
			d3.select(c).selectAll('rect')[0].length.should.equal(6);
		});
		it('4/6 have non-zero height', function () {
			var nonzero = d3.select(c).selectAll('rect');
			nonzero = nonzero.filter(function () {
				return d3.select(this).attr('height') > 0;
			});

			nonzero[0].length.should.equal(4);
		});

	});
});
