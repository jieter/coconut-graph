var d3 = require('d3');

var unnamed_series = 1;

module.exports = function (x, y, plot, graph) {
    var line = function (sel) {
        sel.attr('d', d3.svg.line()
            .x(function(d) { return x(d[0]); })
            .y(function(d) {
                return y(plot.data_function(d)); }));
    };

    var selection = graph.plotContainer
        .selectAll('.series-' + plot.key)
        .data([graph.data.values]);

    selection.enter()
        .append('path')
        .attr({
            class: 'plot plot-line series-' + plot.key,
            'data-legend': plot.label || 'series ' + unnamed_series++
        });
    selection.exit().remove();

    selection.transition().duration(200).call(line);

    return line;
};
