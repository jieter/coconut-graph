var d3 = require('d3');

var unnamed_series = 1;

module.exports = function (x, y, plot, graph) {

    var line = function (s) {
        s.attr('d', d3.svg.line()
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[plot.data_key]); })
        );
    };

    graph.plotContainer.selectAll('.line.' + plot.key)
        .data([graph.data.values])
        .enter()
        .append('path')
            .attr('class', 'plot line ' + plot.key)
            .attr('data-legend', plot.label || 'series ' + unnamed_series++);

    graph.svg.selectAll('.line.' + plot.key)
        .transition().duration(200)
        .call(line);

    return line;
};
