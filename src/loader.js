var Class = require('./class.js');
var Util = require('./util.js');

var d3 = require('d3');

var Graph = require('./graph.js');

module.exports = Class.extend({
	initialize: function (url, options) {
		Util.setOptions(this, options);

		var graphs = {};
		options.graphs.forEach(function(graph) {
			graphs[graph.container] = new Graph(graph);
		});
		this.graphs = graphs;
		this.load(url);
	},

	load: function (url, callback) {
		var self = this;
		this.url = url;
		callback = (callback !== undefined) ? callback : this.options.callback;

		d3.json(url, function(error, response) {
			self.meta = response.meta;
			response.data = self.normalize(response.data);
			for (var key in self.graphs) {
				var graph = self.graphs[key];

				graph.meta = response.meta;
				graph.data = response.data;

				self.graphs[key].render(callback);
			}
		});
		return this;
	},

	load_url: function (name, callback) {
		if (name === 'original' && this.original_url) {
			this.load(this.original_url, callback);
		} else if (name in this.meta.urls) {
			this.load(this.meta.urls[name], callback);
		}
	},

	normalize: function (data) {
		if (data.extents) {
			data.extents = data.extents.map(Graph.parseDatetime);
		}

		var timestamp_idx = data.keys.indexOf('timestamp');
		if (timestamp_idx !== -1) {
			data.values.forEach(function (it, i) {
				data.values[i][timestamp_idx] = Graph.parseDatetime(it[timestamp_idx]);
			}, this);
		}

		return data;
	},
	onResize: function () {
		for (var key in this.graphs) {
			this.graphs[key].onResize();
		}
		return this;
	}
});
