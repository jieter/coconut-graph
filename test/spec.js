/* globals
 describe:true it:true chai:true
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
		'keys': ['timestamp', 'amount', 'test'],
		'extents': ['2015-05-29T00:00:00', '2015-05-29T23:59:59'],
		'values': [
			['2015-05-29T00:00:00', 0, 1],
			['2015-05-29T14:00:00', 50, 2],
			['2015-05-29T14:15:00', 0, 3],
			['2015-05-29T14:30:00', 5, 4],
			['2015-05-29T15:00:00', 6, 5]
		],
		'slices': 96
	}
};

describe('coconut-graph', function () {
	chai.should();

	describe('Graph loader', function () {
		var spy = chai.spy();

		var loader = new Graph.Loader(Graph.util.extend({}, data), {
			graphs: [
				{
					container: 'container1',
					className: 'extra',
					axes: {y: {includeZero: true}},
					plot: {key: 'amount', axis: 'y', label: 'verbruik [l]', type: 'bar'}
				}
			],
			callback: spy
		});
		var container = document.getElementById('container1');

		it('adds classnames to graph container', function () {
			container.className.should.contain('chart');
			container.className.should.contain('extra');
		});

		it('preserves existing classnames on containers', function () {
			container.className.should.contain('container');
		});

		it('should call the callback', function () {
			spy.should.have.been.called();
		});

		it('has attributes set', function () {
			loader.should.contain.keys('meta', 'options');
		});

		it('should create multiple plots in one chart', function () {
			var container = 'container2';
			loader = new Graph.Loader(Graph.util.extend({}, data), {
				graphs: [
					{
						container: container,
						axes: {
							y: {includeZero: true},
							y1: {orient: 'right'}
						},
						plots: [
							{key: 'amount', axis: 'y', label: 'verbruik [l]', type: 'bar'},
							{key: 'test', axis: 'y1', label: 'test', type: 'line'}
						]
					}
				]
			});
			loader.graphs.should.contains.key(container);

			var graph = loader.graphs[container];
			graph.plots.should.have.keys('amount', 'test');

		});

	});
	describe('bar graph', function () {

	});
});
