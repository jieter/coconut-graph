var d3 = require('d3');
var d3tip = require('d3-tip')(d3);


var tip_elem = d3tip().attr('class', 'bar-tooltip').offset([-10, 0]);

var create_tip = function (amount_key, readable_interval) {
    return tip_elem.html(function(d) {
        var amount = d[amount_key];
        if (amount > 1000) {
            amount = Math.round(amount / 1000) + 'm³';
        } else {
            amount = amount + 'l';
        }
        return amount + (readable_interval ? ' / ' + readable_interval : '');
    });
};

module.exports = function (x, y, plot, graph) {
    var key = plot.data_key;
    var yaxis = graph.axes.y;

    var max = d3.max(graph.data.values, function(d) { return d[key]; }) * 1.1;
    y.domain([0, max]).nice();

    // scale axis if above 1000l
    // TODO: move out of plot_bar.
    yaxis.options.tickFormat = function (d) { return (max > 1000) ? (Math.round(d / 100) / 10) : d; };
    yaxis.options.label = 'verbruik ' + ((max > 1000) ? '[m³]' : '[l]');
    yaxis.update();

    var tip = create_tip(key, graph.meta.readable_interval);
    graph.svg.call(tip);

    var height = graph.height();

    var bar = function (s) {
        var sliceWidth = graph.width() / graph.data.slices;
        s.attr({
            x: function(d) { return x(d[0]); },
            y: function() { return y(0); },
            width: sliceWidth,
            height: 0
        }).transition().duration(100)
        .attr({
            height: function(d) { return height - y(d[key]); },
            y: function(d) { return y(d[key]); }
        });
    };


    var sel = graph.plotContainer.selectAll('.plot.series-' + plot.key).data(graph.data.values);
    sel.exit().remove();
    sel.enter().append('rect')
        .attr('class', 'plot plot-bar series-' + plot.key)
        .on({mouseover: tip.show, mouseout: tip.hide});

    sel.call(bar);

    return bar;
};
