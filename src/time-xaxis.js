var d3 = require('d3');
require('./d3.nl_nl.js')(d3);


module.exports = {
    day: function (axes, width) {
        var interval = width > 800 ? 1 :
                       width > 550 ? 2 :
                       width > 400 ? 3 : 4;

        axes.xticks.ticks(d3.time.hours, interval);
        axes.xlabels.ticks(d3.time.hours, interval)
            .tickFormat(d3.locale.nl_NL.timeFormat('%H:%M'));
    },
    week: function (axes, width) {
        axes.xticks.ticks(d3.time.day);

        var tickFormat = (width > 700 ? '%A' : '%a') + ' %-d ';
        tickFormat += (width > 550 ? '%B' :
                       width > 400 ? '%b' : '');

        axes.xlabels
            .ticks(d3.time.hour, 12)
            .tickFormat(function (d) {
                if (d.getHours() === 12) {
                    return d3.locale.nl_NL.timeFormat(tickFormat)(d);
                }
            });
    },
    month: function (axes, width) {
        var wide = width > 550;

        axes.xticks.ticks(d3.time.day, wide ? 1 : 4);
        axes.xlabels.ticks(d3.time.hour, wide ? 12 : 24)
            .tickFormat(function (d) {
                if (wide) {
                    if (d.getHours() === 12) {
                        return d3.locale.nl_NL.timeFormat('%-d')(d);
                    }
                } else if (d.getHours() === 0 && d.getDate() % 4 === 1) {
                    return d3.locale.nl_NL.timeFormat('%-d')(d);
                }
            });
    },
    year: function (axes, width) {
        axes.xticks.ticks(d3.time.month);

        var tickFormat = (width > 550 ? '%B' : '%b');
        axes.xlabels
            .ticks(d3.time.day, 15)
            .tickFormat(function (d) {
                if (d.getDate() === 16) {
                    return d3.locale.nl_NL.timeFormat(tickFormat)(d);
                }
            });
    }
};
