(function () {
	var Graph = {
		Graph: require('./src/graph.js'),
		Loader: require('./src/loader.js'),
		nl_NL: require('./src/d3.nl_nl.js'),
		util: require('./src/util.js')
	};

	if (typeof module === 'object' && module.exports) {
		module.exports = Graph;
	}
	if (window) {
		window.Graph = Graph;
	}
})();
