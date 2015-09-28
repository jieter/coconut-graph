/* globals
  describe:true
  it:true
  chai:true
  d3: true
  Graph:true,
  data:true
 */

(function disableD3animations() {
	// add a duration function to the selection prototype
	d3.selection.prototype.duration = function() { return this; };
	// hack the transition function of d3's select API
	// this is very ugly and only works for the order of chaining used in spinner.js
	d3.selection.prototype.transition = function () {
		this.ease = function () {
			this.duration = function () {
				this.attrTween = function () { return this; };
				return this;
			};
			return this;
		};
		return this;
	};
})();

var container = 'container';
var c = document.getElementById(container);

describe('coconut-graph', function () {
	chai.should();

	var spy = chai.spy();

	var loader = new Graph.Loader(Graph.util.extend({}, data[0]), {
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

	describe('Graph loader', function () {
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

		it('Update graph', function () {
			loader = new Graph.Loader(Graph.util.extend({}, data[0]), {
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
							{key: 'foo', axis: 'y1', label: 'foo', type: 'scatter'},
							{key: function (d) {
								return d[2] - d[1];
							}, axis: 'y', label: 'Composed'}
						]
					}
				]
			});
			loader.graphs.should.contains.key(container);

			// var graph = loader.graphs[container];
			loader.graphs[container].options.plots.forEach(function (plot) {
				plot.should.contain.key('fn');
			});
		});
	});

	describe('bar plot', function () {
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

	describe('scatter plot', function () {
		it('should draw 6 circles', function () {
			d3.select(c).selectAll('circle.series-foo')[0].length.should.equal(6);
		});
	});

	describe('updating graph', function () {
		var get_path = function (selector) {
			return d3.select(selector).attr('d');
		};
		var test_update = function (selector) {
			// initial state
			loader.load_json(data[0]);

			var path = get_path(selector);
			path.should.not.contain('NaN');

			// update
			loader.load_json(data[1]);

			var new_path = get_path(selector);
			new_path.should.not.equal(path);
			new_path.should.not.contain('NaN');
		};

		it('Updates normal line graphs', function () {
			test_update('.series-test');
		});
		it('Updates composed line graphs', function () {
			test_update('.series-composed');
		});
	});
});
