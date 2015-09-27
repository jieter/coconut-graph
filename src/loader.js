var Class = require('./class.js');
var Util = require('./util.js');

var d3 = require('d3');

var Graph = require('./graph.js');

module.exports = Class.extend({
	initialize: function (url, options) {
		Util.setOptions(this, options);

		var graphs = this.graphs = {};
		options.graphs.forEach(function(graph) {
			graphs[graph.container] = new Graph(graph);
		});

		if (typeof url === 'object') {
			this.load_json(url);
		} else {
			this.load(url);
		}
	},

	load: function (url, callback) {
		var self = this;
		this.url = url;

		// TODO: add spinner
		d3.json(url, function(error, response) {
			// TODO: handle error here.
			if (error) {
				console.log(error);
			}

			self.load_json(response, callback);
		});
		return this;
	},

	eachGraph: function (callback) {
		for (var key in this.graphs) {
			callback.call(this, this.graphs[key], key);
		}
	},

	load_json: function (response, callback) {
		callback = (callback !== undefined) ? callback : this.options.callback;

		this.meta = response.meta;
		response.data = this.normalize(response.data);

		this.eachGraph(function (graph, key) {
			graph.meta = response.meta;
			graph.data = response.data;

			this.graphs[key].render(callback);
		});
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
		this.eachGraph(function (graph) {
			graph.onResize();
		});
		return this;
	}
});
