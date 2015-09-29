var d3 = require('d3');
var extend = require('extend');

var defaultOptions = {
    name: 'y',
    orient: 'left',
    label: '',
    tickFormat: null
};

function make_axis(scale, options) {
    var axis = d3.svg.axis().scale(scale).orient(options.orient);

    if ('tickFormat' in options) {
        if (typeof options.tickFormat === 'string') {
            axis.tickFormat(d3.format(options.tickFormat));
        } else {
            axis.tickFormat(options.tickFormat);
        }
    }
    return axis;
}

module.exports = function (graph, options) {
    options = extend({}, defaultOptions, options);
    var name = options.name;

    var scale = d3.scale.linear().rangeRound([graph.height(), 0]);
    var axis = make_axis(scale, options);
    var guides = make_axis(scale, options).tickFormat('');

    var Axis = function () {};
    Axis.name = name;
    Axis.options = options;
    Axis.scale = scale;

    Axis.render = function () {
        var el = graph.svg.append('g').attr('class', 'axis ' + name);

        var text = el.append('text')
            .attr({
                class: 'axislabel',
                transform: 'rotate(-90)'
            }).text(options.label);

        if (options.orient && options.orient === 'right') {
            text.attr('dy', '-.5em');
            el.attr('translate( ' + (graph.width()) + ', 0)');
        } else {
            text.attr({y: 6, dy: '.71em'});
        }
        if (options.guides) {
            // insert guides before plotContainer to make sure
            // the guides are behind the graph.
            graph.svg.insert('g', ':first-child').attr('class', 'grid ' + name);
        }
    };
    Axis.domain = function (extent) {
        return scale.domain(extent).nice();
    };
    Axis.update = function (extent) {
        if (extent) {
            scale.domain(extent).nice();
        }
        axis.ticks(options.ticks);

        var element = graph.svg.selectAll('.axis.' + name).call(axis);
        if (options.orient && options.orient === 'right') {
            element.attr('transform', 'translate(' + graph.width() + ', 0)');
        }
        element.selectAll('.axislabel').text(options.label);

        if (options.guides) {
            guides.tickSize(-graph.width(), 0, 0).ticks(options.ticks);
            graph.svg.selectAll('.grid.' + name).call(guides);
        }
    };

    return Axis;
};
