module.exports = function(x, y, plot, graph) {
    var scatter = function (s) {
        s.attr({
            cx: function(d) { return x(d[0]); },
            cy: function(d) { return y(d[plot.data_key]); }
        });
    };
    var sel = graph.plotContainer.selectAll('circle.series-' + plot.key).data(graph.data.values);
    sel.exit().remove();
    sel.enter()
        .append('circle')
        .attr({
            class: 'plot series-' + plot.key,
            r: 2
        }).call(scatter);

    return scatter;
};
